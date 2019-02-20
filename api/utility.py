import json
import MySQLdb
import configparser

# ===============================================
# Utility file, collect of various utility
# functions for the API
# ===============================================

# Setup configuration file access
config = configparser.ConfigParser()
config.read('config.ini')

# Setup database connection to mims database
mimsDb = MySQLdb.connect(
    host = config['mimsdb']['hostname'],
    user = config['mimsdb']['username'],
    passwd = config['mimsdb']['password'],
    db = config['mimsdb']['database']
)

# Response class to create and format a consistent JSON response
# across the API
class Response:

    def __init__(self):
        self.error = ''
        self.data = {}

    def setError(self, error):
        self.error = error
    
    def hasError(self):
        return bool(self.error)

    def getResponseObject(self):
        if self.hasError():
            return {
                'success': False,
                'error': self.error
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
    for var in required:
        if not var in data:
            response.setError('Missing required input parameters')
    return data