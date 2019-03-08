from flask import Flask
from flask_cors import CORS

# Endpoint blueprint imports
from endpoints.users import usersBlueprint
from endpoints.login import loginBlueprint
from endpoints.products import productsBlueprint
from endpoints.inventory import inventoryBlueprint

# ===============================================
# Main API file, imports endpoints and registers
# the flask app
# ===============================================

app = Flask(__name__)

# Allow access from all origins
CORS(app)

# Register blueprints
app.register_blueprint(usersBlueprint, url_prefix='/users')
app.register_blueprint(loginBlueprint, url_prefix='/login')
app.register_blueprint(productsBlueprint, url_prefix='/products')
app.register_blueprint(inventoryBlueprint, url_prefix='/inventory')