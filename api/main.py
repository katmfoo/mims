from flask import Flask

# Endpoint blueprint imports
from endpoints.users import usersBlueprint
from endpoints.login import loginBlueprint

# ===============================================
# Main API file, imports endpoints and registers
# the flask app
# ===============================================

app = Flask(__name__)

# Register blueprints
app.register_blueprint(usersBlueprint, url_prefix='/users')
app.register_blueprint(loginBlueprint, url_prefix='/login')