from flask import Flask, render_template, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from scripts.get_data import fetch_odds, process_games 
from scripts.dbactions import process_db
from app.sport import get_sports
import json 
from datetime import datetime
from supabase import create_client, Client

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request

# from db.user import get_user

import os

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"
jwt = JWTManager(app)



# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

from db.follow import find_all_events, find_event, update_follow_event, unfollow_event

def retrieve_data(force=False): 
    # Use existing data directory and files
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    processed_file = os.path.join(data_dir, 'processed_games.json')
    
    # Check if current data is recent enough
    if os.path.exists(processed_file) and not force:
        try:
            with open(processed_file, 'r') as f:
                current_data = json.load(f)
                last_update = datetime.strptime(
                    current_data.get('last_update', '2000-01-01 00:00:00'),
                    '%Y-%m-%d %H:%M:%S'
                )
                # If data is less than 24 hours old and we're not forcing update
                age_hours = (datetime.now() - last_update).total_seconds() / 3600
                print(f"Data age: {age_hours:.2f} hours")
                
                if age_hours < 24:
                    print(f"Using existing data (last updated {last_update})")
                    return current_data
                else:
                    print(f"Data is {age_hours:.2f} hours old. Fetching new data...")
        except Exception as e:
            print(f"Error reading current data: {e}")
            print("Will fetch new data...")
    
    # Fetch new data if needed
    quota = 0
    sports = [
        'baseball_mlb',
        'americanfootball_nfl',
        'basketball_nba',
        'basketball_wnba',
        'americanfootball_ncaaf',
        'mma_mixed_martial_arts',
        'tennis_atp_us_open',
        'tennis_wta_us_open',
        'baseball_kbo',
        'baseball_npb'
    ]
    processed_sports = {}
    
    for sport in sports:
        try:
            result = fetch_odds(sport)
            if isinstance(result, tuple):
                curr_data, quota_last_used = result
            else:
                curr_data, quota_last_used = result, 0
            
            quota += quota_last_used
            process_db(curr_data)
            processed_games, _ = process_games(curr_data)
            processed_sports[sport] = processed_games
            print(f"Added {len(processed_games)} games for {sport}")
            
        except Exception as e:
            print(f"Error processing {sport}: {str(e)}")
            processed_sports[sport] = []
    
    processed_sports['last_update'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Update existing files
    with open(processed_file, 'w') as f:
        json.dump(processed_sports, f)
    print("Data updated in processed_games.json")
    
    return processed_sports

@app.route('/')
def home():
    sport_key = request.args.get('sport', 'basketball_nba')
    
    try:
        # Load processed games from the file
        with open('data/processed_games.json', 'r') as f:
            data = json.load(f)
            
        # Get games for the requested sport
        games = data.get(sport_key, [])
        last_updated = data.get('last_update', 'Never')
        
        print(f"Sport: {sport_key}")
        print(f"Number of games: {len(games)}")
        if games:
            print(f"Sample game structure: {games[0]}")
        else:
            print("No games found for this sport")
        
        return render_template('odds.html', games=games, sport=sport_key, last_updated=last_updated)
    except Exception as e:
        print(f"Error in home route: {str(e)}")
        return render_template('error.html', message="Failed to load game data.")


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print(f"data: {data}")
    response = supabase.auth.sign_up({
        "email": data['email'],
        "password": data['password']
    })
    print(f"response: {response}")
    return jsonify({"success": True, "message": "User created", "access_token": access_token})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"data: {data}")
    response = supabase.auth.sign_in_with_password({
        "email": data['email'],
        "password": data['password'],
    })
    print(f"response: {response}")
    access_token = create_access_token(identity=response.user.id)
    print(f"response2: {response}")
    return jsonify({"success": True, "message": "User logged in", "access_token": access_token})

@app.route('/sports')
def sports():
    """
    Return a list of available sports.
    Returns:
        Array<string>: List of sport IDs
    """
    sports_list = list(get_sports())
    # Create a more frontend-friendly mapping for display
    return jsonify(sports_list)

def get_user():
    access_token = '934e98dc-8897-4007-9aee-b29eaceab1a8'
    return access_token

@app.route('/events')
def events():
    """
    Return a list of events/games based on sport and starred status.
    Query Parameters:
        sport (string): Sport ID to filter events
        starred (boolean): Whether to show only starred/followed events
    Returns:
        Array<EventObject>: List of events matching the criteria
    """
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()  # Get the user ID from the token
    print("user_id: ", user_id)
    
    if user_id:
        all_events = find_all_events(user_id)
        print("all_events: ", all_events)
        starred_events = [event['event_id'] for event in all_events.data]
        print("starred_events: ", starred_events)
    else:
        starred_events = []

    sport_key = request.args.get('sport', 'all')
    followed_param = request.args.get('followed', 'false').lower() == 'true'
    print("followed_param: ", followed_param)
    # print(f"starred_events: {starred_events}")
    
    try:
        # Load processed games from the file
        with open('data/processed_games.json', 'r') as f:
            data = json.load(f)
        
        # Remove last_update key since it's not a sport
        if 'last_update' in data:
            last_updated = data.pop('last_update')
        
        # Get games based on sport
        if sport_key == 'all':
            # Flatten all games from all sports
            all_games = []
            for sport_games in data.values():
                if isinstance(sport_games, list):
                    all_games.extend(sport_games)
            games = all_games
        else:
            games = data.get(sport_key, [])
        
        # Filter for starred/followed events if requested
        if followed_param:
            games = [game for game in games if game.get('id') in starred_events]
        
        # Transform games to match the frontend's expected format
        transformed_games = []
        for game in games:
            try:
                # Extract the necessary odds from formatted markets
                odds = {
                    "moneyline": {"home": 0, "away": 0},
                    "spread": {"home": 0, "away": 0, "points": 0},
                    "total": {"over": 0, "under": 0, "points": 0}
                }
                
                for market in game.get('formatted_markets', []):
                    market_type = market.get('type')
                    market_data = market.get('data', [])
                    
                    if market_type == 'h2h':  # Moneyline
                        for outcome in market_data:
                            if outcome['name'] == game['home_team']:
                                odds["moneyline"]["home"] = int(outcome['my_book'])
                            elif outcome['name'] == game['away_team']:
                                odds["moneyline"]["away"] = int(outcome['my_book'])
                    
                    elif market_type == 'spreads':  # Spread
                        for outcome in market_data:
                            if outcome['name'] == game['home_team']:
                                odds["spread"]["home"] = int(outcome['my_book'])
                                odds["spread"]["points"] = float(outcome['my_point'])
                            elif outcome['name'] == game['away_team']:
                                odds["spread"]["away"] = int(outcome['my_book'])
                    
                    elif market_type == 'totals':  # Total
                        for outcome in market_data:
                            if outcome['name'] == 'Over':
                                odds["total"]["over"] = int(outcome['my_book'])
                                odds["total"]["points"] = float(outcome['my_point'])
                            elif outcome['name'] == 'Under':
                                odds["total"]["under"] = int(outcome['my_book'])
                
                transformed_game = {
                    "id": game.get('id'),
                    "homeTeam": game.get('home_team'),
                    "awayTeam": game.get('away_team'),
                    "startTime": game.get('commence_time'),
                    "odds": odds,
                    "isFollowed": game.get('id') in starred_events
                }
                
                transformed_games.append(transformed_game)
            except Exception as e:
                print(f"Error transforming game {game.get('id')}: {str(e)}")
                continue
        
        return jsonify(transformed_games)
    except Exception as e:
        print(f"Error in events route: {str(e)}")
        return jsonify([])

# Add endpoint to star/unstar events
@app.route('/events/<event_id>/follow', methods=['POST'])
@jwt_required()
def star_event(event_id):
    """
    Mark an event as starred/followed.
    URL Parameters:
        event_id (string): ID of the event to star
    """
    
    user_id = get_jwt_identity()
    data = request.get_json()
    update_Follow = data.get('follow')
    print(f"update_Follow: {update_Follow}")
    
    if update_Follow:
        if not find_event(event_id, user_id):
            update_follow_event(event_id, user_id)
    else:
        if find_event(event_id, user_id):
            unfollow_event(event_id, user_id)

    # if update_Follow:
    #     starred_events.add(event_id)
    # else:
    #     if event_id in starred_events:
    #         starred_events.remove(event_id)

    # print(f"starred_events: {starred_events}")

    
    return jsonify({"success": True, "message": f"Event {event_id} updated", "isFollowed": update_Follow})


# Initial run - will only fetch if no data exists
retrieve_data(force=False)

# Setup scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=lambda: retrieve_data(force=False), trigger="interval", minutes=60)
scheduler.start()
