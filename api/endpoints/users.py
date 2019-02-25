from flask import Blueprint, request
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select, func, or_
from utility import Response, checkVars, authenticateRequest, checkPassword, hashPassword, mimsDbEng, resultSetToJson, setLimit, checkUsername

# ===============================================
# Users endpoints
# ===============================================

usersBlueprint = Blueprint('users', __name__)

# Endpoint to get users
# GET /users/
# Auth: Must be manager to access
# Required params: none
# Optional params: username, first_name, last_name, search_term, type, page_size, page
# Returns: A list of users and total users if limit is sent
@usersBlueprint.route('/', methods=['GET'])
def getUsers():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    data = checkVars(response, request.values.to_dict(), required)
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
# Required params: username, first_name, last_name, password, type
# Optional params: none
# Returns: The user id of the newly created user
@usersBlueprint.route('/', methods=['POST'])
def createUser():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = ['username', 'first_name', 'last_name', 'password', 'type']
    data = checkVars(response, request.get_json(), required)
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