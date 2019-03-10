from flask import Blueprint, request
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select
import datetime
from utility import Response, checkVars, authenticateRequest, mimsDbEng

# Business function imports
from .businesses.target import targetGetProduct, targetGetUnit, targetCreateInventoryTransaction

# ===============================================
# Inventory endpoints
# ===============================================

inventoryBlueprint = Blueprint('inventory', __name__)

# Endpoint to create an inventory transaction
# POST /inventory/
# Auth: Access token required, can be employee or manager
# Returns: The inventory transaction id of the newly created inventory transaction
@inventoryBlueprint.route('/', methods=['POST'])
def createInventoryTransaction():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, mustBeManager=True)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = ['item_code', 'amount', 'unit', 'datetime']
    optional = []
    data = checkVars(response, request.get_json(), required, optional)
    if response.hasError(): return response.getJson()

    if 'price' in data and not checkPrice(response, data['price']):
        return response.getJson()
    
    if not type(data['amount']) is int or not type(data['amount']) is float:
        return response.setError(21)
    
    try:
        datetime.datetime.strptime(data['datetime'], "%Y-%m-%d %H:%M:%S")
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
        product = targetGetProduct(data['item_code'])
        if not product: return response.setError(18)
        unit = targetGetUnit(data['unit'])
        if not unit: return response.setError(20)
        response.data['inventory_transaction'] = targetCreateInventoryTransaction(data)
    
    return response.getJson()