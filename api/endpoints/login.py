from flask import Blueprint, request
import jwt
from passlib.hash import argon2
import datetime
from utility import Response, checkVars, mimsDb, config

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
    cur = mimsDb.cursor()
    cur.execute("select id, password_hash from users where username='%s'"%(data['username']))
    sqlResponse = cur.fetchone()
    if sqlResponse:
        userId, rightPasswordHash = sqlResponse
    else:
        response.setError('Username and password combination not found')
        return response.getJson()

    # Verify that the password hash is valid
    if not argon2.verify(data['password'], rightPasswordHash):
        response.setError('Username and password combination not found')
        return response.getJson()
    
    # Generate and attach access token to response data
    response.data['accessToken'] = jwt.encode({
        'userId': userId, 
        'exp': datetime.datetime.now() + datetime.timedelta(hours=1)
    }, config['jwt']['secret'], algorithm='HS256').decode('utf-8')
    
    return response.getJson()