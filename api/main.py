from flask import Flask

# Endpoint blueprint imports
from endpoints.users import usersBlueprint
from endpoints.login import loginBlueprint
from endpoints.products import productsBlueprint

# Business blueprint imports
from endpoints.businesses.shoprite import shopriteBlueprint

# ===============================================
# Main API file, imports endpoints and registers
# the flask app
# ===============================================

app = Flask(__name__)

# Register blueprints
app.register_blueprint(usersBlueprint, url_prefix='/users')
app.register_blueprint(loginBlueprint, url_prefix='/login')
app.register_blueprint(productsBlueprint, url_prefix='/products')

# Register blueprints for businesses
app.register_blueprint(shopriteBlueprint, url_prefix='/businesses/shoprite')