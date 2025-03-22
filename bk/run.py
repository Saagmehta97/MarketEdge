from app import app
from flask_cors import CORS

CORS(app, resources={r"/*":{"origins": "*"}})

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # Use a different port like 5001


    
