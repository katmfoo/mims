import json
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.sql import select
import configparser
import jwt
from passlib.hash import argon2

# ===============================================
# Utility file, collect of various utility
# functions for the API
# ===============================================

# Setup configuration file access
config = configparser.ConfigParser()
config.read('config.ini')

# Setup database engine for mims database
mimsDbEng = create_engine("mysql://%s:%s@%s/%s"%(config['mimsdb']['username'], config['mimsdb']['password'], config['mimsdb']['hostname'], config['mimsdb']['database']))

# Setup response error codes and messages
responseErrors = {
    1: 'Missing required input parameters',
    2: 'Invalid login credentials',
    3: 'Access token required for this endpoint',
    4: 'Access token has expired',
    5: 'Access token is invalid',
    6: 'Permission denied',
    7: 'Username is already taken',
    8: 'Password must be atleast 8 characters',
    9: 'Page cannot be 0',
    10: 'Username must be atleast 8 characters'
}

# Response class to create and format a consistent JSON response
# across the API
class Response:

    def __init__(self):
        self.error_code = 0
        self.data = {}

    def setError(self, error_code):
        self.error_code = error_code
        return self.getJson()
    
    def hasError(self):
        return bool(self.error_code)

    def getResponseObject(self):
        if self.hasError():
            return {
                'success': False,
                'error': {
                    'code': self.error_code,
                    'message': responseErrors[self.error_code]
                }
            }
        else:
            return {
                'success': True,
                'data': self.data
            }
    
    def getJson(self):
        return json.dumps(self.getResponseObject())

# Function to ensure that all required input parameters for an endpoint
# are contained within the data passed into the endpoint
def checkVars(response, data, required):
    if not data:
        data = {}
        
    for var in required:
        if not var in data:
            response.setError(1)
            return False

    # Error check data
    for var in data:
        if var == 'page':
            if int(data['page']) == 0:
                response.setError(9)
                return False

    if data:
        return data
    else:
        return {}

# Function to ensure that the user making this request has the correct
# permissions to do so. Ensures a valid access token is sent up with
# the request an optionally ensures the user of the token is a
# manager. Returns the user id that the token belongs to if successful,
# otherwise False
def authenticateRequest(response, request, must_be_manager = False):

    # Retrieve access token from request headers
    access_token = request.headers.get('access-token')

    # If 'access-token' header isn't sent up, return error
    if not access_token:
        response.setError(3)
        return False
    
    decoded = None

    # Attempt to decode access token, throw relevent errors if unsuccessful
    try:
        decoded = jwt.decode(access_token, config['jwt']['secret'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        response.setError(4)
        return False
    except:
        response.setError(5)
        return False
    
    # If must be manager, check that the user is a manger. Otherwise just return userId
    if must_be_manager:
        # Query users table for user, select user type
        con = mimsDbEng.connect()
        users = Table('users', MetaData(mimsDbEng), autoload=True)
        stm = select([users]).where(users.c.id == decoded['userId'])
        user = con.execute(stm).fetchone()
        con.close()

        if user:
            # If user isn't a manager, permission denied. Otherwise return user id
            if user['type'] != 1:
                response.setError(6)
                return response.getJson()
            else:
                return decoded['userId']
        else:
            # Couldn't find user, access token invalid
            response.setError(5)
            return response.getJson()
    else:
        return decoded['userId']

# Function to check the validity of a password and add errors to response
# if not valid
def checkPassword(response, password):
    if len(password) < 8:
        response.setError(8)
        return False
    return True

# Function to check the validity of a username and add errors to response
# if not valid
def checkUsername(response, username):
    if len(username) < 8:
        response.setError(10)
        return False
    return True

# Function to hash a plaintext password. Returns the hashed password
def hashPassword(password):
    return argon2.hash(password)

# Function to verify that a plaintext password is valid for a specific
# user. Returns True if password is valid, False otherwise
def verifyPassword(userId, password):
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)
    stm = select([users]).where(users.c.id == userId)
    user = con.execute(stm).fetchone()
    con.close()

    # Verify that the password hash is valid
    if not argon2.verify(password, user['password_hash']):
        return False
    
    return True

# Function to convert a SQLAlchemy result set to a dict that can be
# easily converted to JSON
def resultSetToJson(resultSet, exclusions = []):
    newList = []
    for result in resultSet:
        newItem = {}
        for key, val in result.items():
            if key not in exclusions:
                newItem[key] = str(val)
        newList.append(newItem)
    return newList

# Function to set the proper limit and offset values on a SQLAlchemy
# statement using the passed in data object to the endpoint
def setLimit(stm, data):
    if data.get('page_size'):
        if not data.get('page'):
            data['page'] = 1
        stm = stm.limit(data['page_size'])
        stm = stm.offset(int(data['page_size']) * (int(data['page']) - 1))
    return stm
