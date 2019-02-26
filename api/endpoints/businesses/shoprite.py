from flask import Blueprint, request
from utility import Response, checkVars, authenticateRequest

# ===============================================
# ShopRite endpoints
# ===============================================

blueprintName = 'shoprite'
shopriteBlueprint = Blueprint(blueprintName, __name__)

# Endpoint to get products from ShopRite
# GET /businesses/shoprite/products/
# Auth: Must be employee of ShopRite to accesss
# Returns: A list of products
@shopriteBlueprint.route('/products/', methods=['GET'])
def getProducts():
    response = Response()

    # Ensure user has permission for this endpoint
    userId = authenticateRequest(response, request, fromBusiness=blueprintName)
    if response.hasError(): return response.getJson()

    # Ensure required input parameters are received
    required = []
    optional = []
    data = checkVars(response, request.values.to_dict(), required, optional)
    if response.hasError(): return response.getJson()
    
    return response.getJson()