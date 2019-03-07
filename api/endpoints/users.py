from flask import Blueprint, request
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select, func, or_, update, and_
from utility import Response, checkVars, authenticateRequest, checkPassword, hashPassword, mimsDbEng, resultSetToJson, setPagination, checkUsername, verifyPassword, checkUserType

# ===============================================
# Users endpoints
# ===============================================

usersBlueprint = Blueprint('users', __name__)

# Endpoint to get users
# GET /users/
# Auth: Access token required, must be a manager
# Returns: A list of users
@usersBlueprint.route('/', methods=['GET'])
def getUsers():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, mustBeManager=True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = ['username', 'first_name', 'last_name', 'search_term', 'type', 'page_size', 'page']
    data = checkVars(response, request.values.to_dict(), required, optional)
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Get business of user making request
    stm = select([users]).where(users.c.id == userId)
    userBusiness = con.execute(stm).fetchone()['business']

    # Setup main select statement
    stm = select([users]).where(and_(users.c.business == userBusiness, users.c.is_deleted == 0))

    # Handle optional filters
    if 'username' in data:
        stm = stm.where(users.c.username.like('%' + data['username'] + '%'))
    if 'first_name' in data:
        stm = stm.where(users.c.first_name.like('%' + data['first_name'] + '%'))
    if 'last_name' in data:
        stm = stm.where(users.c.last_name.like('%' + data['last_name'] + '%'))
    if 'type' in data:
        stm = stm.where(users.c.type == data['type'])

    # Handle search_term
    if 'search_term' in data:
        search_term = '%' + data['search_term'] + '%'
        stm = stm.where(or_(
            users.c.first_name.like(search_term),
            users.c.last_name.like(search_term),
            users.c.username.like(search_term),
            func.concat(users.c.first_name, ' ', users.c.last_name).like(search_term)
        ))
    
    # Handle page_size and page
    stm = setPagination(stm, data)

    response.data['items'] = resultSetToJson(con.execute(stm).fetchall(), ['password_hash', 'business', 'is_deleted', 'updated_datetime', 'creation_datetime'])

    con.close()

    return response.getJson()

# Endpoint to create a user
# POST /users/
# Auth: Access token required, must be a manager
# Returns: The user id of the newly created user
@usersBlueprint.route('/', methods=['POST'])
def createUser():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, mustBeManager=True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = ['username', 'first_name', 'last_name', 'password', 'type']
    optional = []
    data = checkVars(response, request.get_json(), required, optional)
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Select the business of this manager so we know what business to make
    # the user for
    stm = select([users]).where(users.c.id == userId)
    businessId = con.execute(stm).fetchone()['business']

    # Check username validity
    if not checkUsername(response, data['username']):
        return response.getJson()

    # Check validity of type
    if not checkUserType(response, data['type']):
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
    stm = users.insert().values(username=data['username'], password_hash=hashedPassword, first_name=data['first_name'], last_name=data['last_name'], type=data['type'], business=businessId)
    result = con.execute(stm)

    # Attach newly created user id to response data
    response.data['userId'] = result.lastrowid

    con.close()

    return response.getJson()

# Endpoint to edit a user
# PUT /users/{user_id}/
# Auth: Access token required, can be employee or manager (different functionality allowed for each)
# Returns: The user id of the updated user
@usersBlueprint.route('/<userIdToEdit>/', methods=['PUT'])
def editUser(userIdToEdit):
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = ['username', 'first_name', 'last_name', 'new_password', 'current_password', 'type', 'is_deleted']
    data = checkVars(response, request.get_json(), required, optional, atLeastOneOptional=True)
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Ensure user exists
    stm = select([users]).where(users.c.id == userIdToEdit)
    userToEdit = con.execute(stm).fetchone()
    if not userToEdit:
        return response.setError(11)

    # Get user making request
    stm = select([users]).where(users.c.id == userId)
    userMakingRequest = con.execute(stm).fetchone()

    # Permission checking for if user making request is manager
    if userMakingRequest['type'] == 1:
        # Ensure user making request is in same business as user being editted, if not, permission denied
        if userMakingRequest['business'] != userToEdit['business']:
            return response.setError(6)
    elif userMakingRequest['type'] == 2:
        # User is employee, permission checking for if user is employee

        # Ensure they are editing themselves, if not, permission denied
        if userId != userToEdit['id']:
            return response.setError(6)

        # Ensure they are not trying to edit type or is_deleted
        if 'type' in data or 'is_deleted' in data:
            return response.setError(6)

        # If they are trying to set a new password
        if 'new_password' in data:

            # Ensure they passed in their current password
            if not 'current_password' in data:
                return response.setError(13)
            
            # Verify current password
            if not verifyPassword(userIdToEdit, data['current_password']):
                return response.setError(14)

    # Check validity of username if set
    if 'username' in data:
        # Check username validity
        if not checkUsername(response, data['username']):
            return response.getJson()
        
        # Ensure username is not already taken
        stm = select([users]).where(and_(users.c.username == data['username'], users.c.id != userIdToEdit))
        if con.execute(stm).fetchone():
            return response.setError(7)
    
    # Check validity of type if set
    if 'type' in data:
        if not checkUserType(response, data['type']):
            return response.getJson()
    
    # Check validity of is_deleted if set
    if 'is_deleted' in data:
        if not type(data['is_deleted']) is bool:
            return response.setError(16)
    
    # Handle new password hashing and validity
    hashedNewPassword = None
    if 'new_password' in data:
        # Check validity of new password
        if not checkPassword(response, data['new_password']):
            return response.getJson()
        
        # Hash new password to store in database
        hashedNewPassword = hashPassword(data['new_password'])

    # Main update statement
    stm = users.update().where(users.c.id == userIdToEdit)

    # Check potential passed in params to update
    if 'username' in data:
        stm = stm.values(username=data['username'])
    if 'first_name' in data:
        stm = stm.values(first_name=data['first_name'])
    if 'last_name' in data:
        stm = stm.values(last_name=data['last_name'])
    if 'new_password' in data:
        stm = stm.values(password_hash=hashedNewPassword)
    if 'type' in data:
        stm = stm.values(type=data['type'])
    if 'is_deleted' in data:
        stm = stm.values(is_deleted=data['is_deleted'])

    result = con.execute(stm)

    # Attach newly created user id to response data
    response.data['userId'] = int(userIdToEdit)

    con.close()

    return response.getJson()