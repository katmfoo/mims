from flask import Blueprint, request
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select
import jwt
from utility import Response, checkVars, config, verifyPassword, mimsDbEng

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

    # Setup database connection, table, and query
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)
    
    # Get user id of username passed in, also ensure user exists
    stm = select([users]).where(users.c.username == data['username'])
    user = con.execute(stm).fetchone()
    if not user:
        return response.setError(2)

    # Verify that the password hash is valid
    if not verifyPassword(user['id'], data['password']):
        return response.setError(2)
    
    # Generate and attach access token to response data
    response.data['accessToken'] = jwt.encode({
        'userId': user['id']
    }, config['jwt']['secret'], algorithm='HS256').decode('utf-8')

    con.close()
    
    return response.getJson()