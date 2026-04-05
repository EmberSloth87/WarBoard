import os
import secrets


basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.makedirs(basedir, exist_ok=True) 

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(16)

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'server', 'data', 'warboard.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.path.join(basedir, 'app', 'static', 'images', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB