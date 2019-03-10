from flask import Blueprint, request
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select
import datetime
from utility import Response, checkVars, authenticateRequest, mimsDbEng

# Business function imports
from .businesses.target import targetGetProduct, targetCreateSale

# ===============================================
# Sales endpoints
# ===============================================

salesBlueprint = Blueprint('sales', __name__)

# Endpoint to create a sale
# POST /sales/
# Auth: Access token required, can be employee or manager
# Returns: The sale id of the newly created sale
@salesBlueprint.route('/', methods=['POST'])
def createSale():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, mustBeManager=True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = ['items']
    optional = []
    data = checkVars(response, request.get_json(), required, optional)
    if response.hasError(): return response.getJson()

    for item in data['items']:
        # Ensure item is not missing required data
        if not 'item_code' in item or not 'amount' in item or not 'datetime' in item:
            return response.setError(23)
        
        # Ensure amount is formatted properly
        if not type(item['amount']) is int and not type(item['amount']) is float:
            return response.setError(21)

        # Ensure datetime is formatted properly
        try:
            datetime.datetime.strptime(item['datetime'], "%Y-%m-%d %H:%M:%S")
        except:
            return response.setError(22)

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Get the business reference of the business of the user making this request
    stm = select([users]).where(users.c.id == userId)
    businessId = con.execute(stm).fetchone()['business']

    # Call the relevant get products function depending on business to get response data
    if businessId == 1:
        # Ensure each item code is accurate
        for item in data['items']:
            product = targetGetProduct(item['item_code'])
            if not product: return response.setError(24)
        
        response.data['sale'] = targetCreateSale(data)
    
    return response.getJson()