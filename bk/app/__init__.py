from flask import Flask, render_template, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
from scripts.get_data import fetch_odds,process_games 
from scripts.dbactions import process_db
import json 
from datetime import datetime

app = Flask(__name__)

def retrieve_data(): 
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
            # Fetch odds and ensure two values are always returned, default quota_last_used to 0 if not returned
            result = fetch_odds(sport)
            if isinstance(result, tuple):
                curr_data, quota_last_used = result
            else:
                curr_data, quota_last_used = result, 0
            
            quota += quota_last_used
            
            # Process data into the database
            process_db(curr_data)
            
            # Process games, not database, to get the processed games
            processed_games, _ = process_games(curr_data)
            
            # Add processed games to the results
            processed_sports[sport] = processed_games
            print(f"Added {len(processed_games)} games for {sport}")
            
        except Exception as e:
            print(f"Error processing {sport}: {str(e)}")
            processed_sports[sport] = []
    
    processed_sports['last_update'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Write the processed games to a JSON file
    with open('data/processed_games.json', 'w') as f:
        json.dump(processed_sports, f)
    
    print("Data saved to processed_games.json")
    
@app.route('/')
def home():
    sport_key = request.args.get('sport', 'baseball_mlb')
    
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

#Initial run
retrieve_data()

# Setup scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=retrieve_data, trigger="interval", minutes=20)
scheduler.start()
