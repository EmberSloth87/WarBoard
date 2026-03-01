#!/usr/bin/env python3
"""
WarBoard app initialization

@author: Owen McCredie
@version: 2025.12
"""

from flask import Flask, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=None):
    app = Flask(__name__)

    CORS(app)
    
    if config_class is None:
        from app.server.config import Config
        config_class = Config
    
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models after db is initialized
    from app.server import models

    # Register your routes Blueprint (from the previous step)
    from app.server.routes import api_bp
    app.register_blueprint(api_bp)
    
    @app.route('/')
    def root():
        return redirect(url_for('client.index'))
    
    return app