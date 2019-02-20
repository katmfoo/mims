from flask import Blueprint, request
from utility import Response, checkVars, mimsDb

# ===============================================
# Users endpoints
# ===============================================

usersBlueprint = Blueprint('users', __name__)

@usersBlueprint.route('/', methods=['POST'])
def createUser():
    return 'create user endpoint'