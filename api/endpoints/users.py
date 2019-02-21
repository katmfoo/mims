from flask import Blueprint, request
from utility import Response, checkVars, authenticateRequest, mimsDb, checkPassword, hashPassword

# ===============================================
# Users endpoints
# ===============================================

usersBlueprint = Blueprint('users', __name__)

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

    # Select the business_id of this manager so we know what business to make
    # the employee for
    db = mimsDb()
    cur = db.cursor()
    cur.execute("select business_id from users where id='%s'"%(userId))
    sqlResponse = cur.fetchone()
    db.close()
    businessId = sqlResponse[0]

    # Ensure username is not already taken
    db = mimsDb()
    cur = db.cursor()
    cur.execute("select id from users where username='%s'"%(data['username']))
    sqlResponse = cur.fetchone()
    db.close()

    # If we get any response, username is already taken, return error
    if sqlResponse:
        return response.setError(7)
    
    # Check password validity
    if not checkPassword(response, data['password']):
        return response.getJson()
    
    # Hash password to store in database
    hashedPassword = hashPassword(data['password'])
    
    # Create user
    db = mimsDb()
    cur = db.cursor()
    cur.execute("insert into users (username, password_hash, first_name, last_name, type, business_id) values ('%s', '%s', '%s', '%s', '%s', '%s')"%(data['username'], hashedPassword, data['first_name'], data['last_name'], data['type'], businessId))
    db.commit()

    # Attach newly created user id to response data
    response.data['userId'] = cur.lastrowid

    db.close()

    return response.getJson()