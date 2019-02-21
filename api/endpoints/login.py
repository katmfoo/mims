from flask import Blueprint, request
import jwt
from passlib.hash import argon2
import datetime
from utility import Response, checkVars, mimsDb, config, verifyPassword

# ===============================================
# Login endpoints
# ===============================================

loginBlueprint = Blueprint('login', __name__)

@loginBlueprint.route('/', methods=['POST'])
def login():
    response = Response()

    # Ensure required input parameters are received
    required = ['username', 'password']
    data = checkVars(response, request.get_json(), required)
    if response.hasError(): return response.getJson()

    # Query users table for username and password combo
    db = mimsDb()
    cur = db.cursor()
    cur.execute("select id from users where username='%s'"%(data['username']))
    sqlResponse = cur.fetchone()
    db.close()

    if sqlResponse:
        userId = sqlResponse[0]
    else:
        return response.setError(2)

    # Verify that the password hash is valid
    if not verifyPassword(userId, data['password']):
        return response.setError(2)
    
    # Generate and attach access token to response data
    response.data['accessToken'] = jwt.encode({
        'userId': userId
    }, config['jwt']['secret'], algorithm='HS256').decode('utf-8')
    
    return response.getJson()