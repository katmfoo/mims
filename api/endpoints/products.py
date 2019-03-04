from flask import Blueprint, request, redirect, url_for
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select
from utility import Response, checkVars, authenticateRequest, mimsDbEng

# Business function imports
from .businesses.shoprite import shopRiteGetProducts, shopRiteGetProduct

# ===============================================
# Product endpoints
# ===============================================

productsBlueprint = Blueprint('products', __name__)

# Endpoint to get products
# GET /products/
# Auth: Access token required, can be employee or manager
# Returns: A list of products
@productsBlueprint.route('/', methods=['GET'])
def getProducts():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = ['name', 'item_code', 'plu', 'barcode', 'department', 'search_term', 'page_size', 'page']
    data = checkVars(response, request.values.to_dict(), required, optional)
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Get the business reference of the business of the user making this request
    stm = select([users]).where(users.c.id == userId)
    businessId = con.execute(stm).fetchone()['business']

    # Call the relevant get products function depending on business to get response data
    if businessId == 1:
        response.data = shopRiteGetProducts(data)
    
    return response.getJson()

# Endpoint to get a specific product
# GET /products/<item_code>/
# Auth: Access token required, can be employee or manager
# Returns: A single product
@productsBlueprint.route('/<itemCode>/', methods=['GET'])
def getProduct(itemCode):
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = []
    data = checkVars(response, request.values.to_dict(), required, optional)
    if response.hasError(): return response.getJson()

    # Setup database connection and table
    con = mimsDbEng.connect()
    users = Table('users', MetaData(mimsDbEng), autoload=True)

    # Get the business reference of the business of the user making this request
    stm = select([users]).where(users.c.id == userId)
    businessId = con.execute(stm).fetchone()['business']

    # Call the relevant get products function depending on business to get response data
    if businessId == 1:
        response.data = shopRiteGetProduct(itemCode)
    
    return response.getJson()