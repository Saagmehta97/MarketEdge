from app import app
from flask_cors import CORS
from dotenv import load_dotenv
import os

CORS(app, resources={r"/*":{"origins": "*"}})

# Load environment variables from .env file
load_dotenv()

if __name__ == '__main__':
    # Check if API key is available
    api_key = os.getenv('THE_ODDS_API_KEY')
    if api_key:
        print("API key loaded successfully!")
    else:
        print("Warning: API key not found. Make sure it's set in .env file.")
    
    app.run(debug=True, host='0.0.0.0', port=5001)


    
