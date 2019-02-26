from flask import Blueprint, request, redirect, url_for
from sqlalchemy import Table, MetaData
from sqlalchemy.sql import select
from utility import Response, checkVars, authenticateRequest, mimsDbEng

# ===============================================
# Product endpoints
# ===============================================

productsBlueprint = Blueprint('products', __name__)

# Endpoint to get products
# GET /products/
# Auth: Must be employee to access
# Returns: A list of products
@productsBlueprint.route('/', methods=['GET'])
def getProducts():
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
    businesses = Table('businesses', MetaData(mimsDbEng), autoload=True)

    # Get the business reference of the business of the user making this request
    stm = select([users]).where(users.c.id == userId)
    businessId = con.execute(stm).fetchone()['business_id']
    stm = select([businesses]).where(businesses.c.id == businessId)
    businessReference = con.execute(stm).fetchone()['reference']
    
    # Return redirect to correct business endpoint with same query params
    return redirect(url_for(businessReference + '.getProducts') + '?' + request.query_string.decode('utf-8'))