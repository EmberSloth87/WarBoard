# ALGORITHM: Import the application factory and create the app instance for the CLI/Server
from app.server import create_app

# Create the instance that Flask will look for
app = create_app()

if __name__ == "__main__":
    app.run() # Evaluates if the script is being run directly to start the local server

