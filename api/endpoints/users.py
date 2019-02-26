from flask import Blueprint, request
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select, func, or_, update, and_
from utility import Response, checkVars, authenticateRequest, checkPassword, hashPassword, mimsDbEng, resultSetToJson, setLimit, checkUsername, verifyPassword

# ===============================================
# Users endpoints
# ===============================================

usersBlueprint = Blueprint('users', __name__)

# Endpoint to get users
# GET /users/
# Auth: Must be manager to access
# Returns: A list of users and total users if limit is sent
@usersBlueprint.route('/', methods=['GET'])
def getUsers():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = ['username', 'first_name', 'last_name', 'search_term', 'type', 'page_size', 'page']
    data = checkVars(response, request.values.to_dict(), required, optional)
    if response.hasError(): return response.getJson()

    # Setup database connection, table, and query
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)
    stm = select([users])

    # Handle optional filters
    if data.get('username'):
        stm = stm.where(users.c.username == data['username'])
    if data.get('first_name'):
        stm = stm.where(users.c.first_name == data['first_name'])
    if data.get('last_name'):
        stm = stm.where(users.c.last_name == data['last_name'])
    if data.get('type'):
        stm = stm.where(users.c.type == data['type'])

    # Handle search_term
    if data.get('search_term'):
        search_term = '%' + data['search_term'] + '%'
        stm = stm.where(or_(
            users.c.first_name.like(search_term),
            users.c.last_name.like(search_term),
            users.c.username.like(search_term),
            func.concat(users.c.first_name, ' ', users.c.last_name).like(search_term)
        ))
    
    # Handle page_size and page
    stm = setLimit(stm, data)

    response.data['items'] = resultSetToJson(con.execute(stm).fetchall(), ['password_hash'])

    con.close()

    return response.getJson()

# Endpoint to create a user
# POST /users/
# Auth: Must be manager to access
# Returns: The user id of the newly created user
@usersBlueprint.route('/', methods=['POST'])
def createUser():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = ['username', 'first_name', 'last_name', 'password', 'type']
    optional = []
    data = checkVars(response, request.get_json(), required, optional)
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Select the business_id of this manager so we know what business to make
    # the employee for
    stm = select([users]).where(users.c.id == userId)
    businessId = con.execute(stm).fetchone()['business_id']

    # Check username validity
    if not checkUsername(response, data['username']):
        return response.getJson()

    # Ensure username is not already taken
    stm = select([users]).where(users.c.username == data['username'])
    if con.execute(stm).fetchone():
        return response.setError(7)
    
    # Check password validity
    if not checkPassword(response, data['password']):
        return response.getJson()
    
    # Hash password to store in database
    hashedPassword = hashPassword(data['password'])

    # Create user
    stm = users.insert().values(username=data['username'], password_hash=hashedPassword, first_name=data['first_name'], last_name=data['last_name'], type=data['type'], business_id=businessId)
    result = con.execute(stm)

    # Attach newly created user id to response data
    response.data['userId'] = result.lastrowid

    con.close()

    return response.getJson()

# Endpoint to edit a user
# PUT /users/
# Auth: Must be manager to access
# Returns: The user id of the updated user
@usersBlueprint.route('/<userIdToEdit>/', methods=['PUT'])
def editUser(userIdToEdit):
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = ['username', 'first_name', 'last_name', 'new_password', 'current_password']
    data = checkVars(response, request.get_json(), required, optional, {'atLeastOneOptional': True})
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Ensure user exists
    stm = select([users]).where(users.c.id == userIdToEdit)
    if not con.execute(stm).fetchone():
        return response.setError(11)

    if data.get('username'):
        # Check username validity
        if not checkUsername(response, data['username']):
            return response.getJson()
        
        # Ensure username is not already taken
        stm = select([users]).where(and_(users.c.username == data['username'], users.c.id != userIdToEdit))
        if con.execute(stm).fetchone():
            return response.setError(7)
    
    hashedNewPassword = None

    # If they are trying to set a new password
    if data.get('new_password'):

        # Ensure they passed in their current password
        if not data.get('current_password'):
            return response.setError(13)
        
        # Verify current password
        if not verifyPassword(userIdToEdit, data['current_password']):
            return response.setError(14)
        
        # Check validity of new password
        if not checkPassword(response, data['new_password']):
            return response.getJson()
        
        # Hash new password to store in database
        hashedNewPassword = hashPassword(data['new_password'])

    # Main update statement
    stm = users.update().where(users.c.id == userIdToEdit)

    # Check potential passed in params to update
    if data.get('username'):
        stm = stm.values(username=data['username'])
    if data.get('first_name'):
        stm = stm.values(first_name=data['first_name'])
    if data.get('last_name'):
        stm = stm.values(last_name=data['last_name'])
    if data.get('new_password'):
        stm = stm.values(password_hash=hashedNewPassword)

    result = con.execute(stm)

    # Attach newly created user id to response data
    response.data['userId'] = int(userIdToEdit)

    con.close()

    return response.getJson()