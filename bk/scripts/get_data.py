import requests
import json
import os
from datetime import datetime, timezone, timedelta
import logging 
import time
from dotenv import load_dotenv


my_bookmakers = ['fanduel', 'draftkings','espnbet','williamhill_us']
sharp_bookmakers = ['pinnacle']


# Use THE_ODDS_API_KEY instead of API_KEY
THE_ODDS_API_KEY = os.getenv('THE_ODDS_API_KEY')
if not THE_ODDS_API_KEY:
    raise ValueError("THE_ODDS_API_KEY environment variable is not set")


def get_best_odds(books): 
    market_type = list(books.values())[0]['key']
    outcomes = {} 
    for book, details in books.items(): 
        for outcome in details['outcomes']:
            name = outcome['name']
            price = outcome['price']
            point = outcome.get('point', None)
            if name not in outcomes:
                outcomes[name] = {
                    'best_price': price,
                    'best_point': point,
                    'sportsbook': book
                }
            else:
                current_best = outcomes[name]
                if market_type == 'h2h':
                    if price > current_best['best_price']:
                        outcomes[name] = {
                            'best_price': price,
                            'best_point': point,
                            'sportsbook': book
                        }
                elif market_type == 'totals':
                    if name == 'Over':
                        if point < current_best['best_point'] or (point == current_best['best_point'] and price > current_best['best_price']):
                            outcomes[name] = {
                                'best_price': price,
                                'best_point': point,
                                'sportsbook': book
                            }
                    elif name == 'Under':
                        if point > current_best['best_point'] or (point == current_best['best_point'] and price > current_best['best_price']):
                            outcomes[name] = {
                                'best_price': price,
                                'best_point': point,
                                'sportsbook': book
                            }
                elif market_type == 'spreads':
                    if abs(point) > abs(current_best['best_point']) or (abs(point) == abs(current_best['best_point']) and price > current_best['best_price']):
                        outcomes[name] = {
                            'best_price': price,
                            'best_point': point,
                            'sportsbook': book
                        }
    best_odds = []
    for name, details in outcomes.items():
        best_odds.append({
            'name': name,
            'price': details['best_price'],
            'point': details['best_point'],
            'sportsbook': details['sportsbook']
        })
    
    return best_odds


def find_matching_outcome(outcomes, target): 
    for outcome in outcomes:
        if outcome['name'] == target['name'] and outcome['point'] == target['point']:
            return outcome
    return None

def check_alt_line(eventId,market_type,sport,my_outcome):
    event_url = f'https://api.the-odds-api.com/v4/sports/{sport}/events/{eventId}/odds'
    params = {
        "apiKey" : THE_ODDS_API_KEY,
        "bookmakers" : "pinnacle",
        "markets" : market_type,
        "oddsFormat" : "american"
    }

    response = requests.get(event_url,params=params)
    quota_used = int(response.headers._store.get('x-requests-last')[1])
    time.sleep(1)
    
    if response.status_code != 200:
        print(f"Error fetching alternate lines: {response.status_code}")
        return None, quota_used
        
    alt_lines = response.json()['bookmakers'][0]['markets'][0]['outcomes']
    matching_alt_line = find_matching_outcome(alt_lines,my_outcome)
    if matching_alt_line is not None: 
        my_prob = american_to_probability(int(my_outcome['price']))
        p_prob = american_to_probability(int(matching_alt_line['price']))
        if (p_prob - my_prob) >= 1:
            return matching_alt_line, quota_used 
    return None,quota_used
def match_market(market_lst,market_type): 
    for market in market_lst: 
        if market['key'] == market_type:
            return market  
    return None 

def get_markets_by_type(bookmakers, market_type):
    result = {}
    for bookmaker, market_lst in bookmakers.items():
        market = match_market(market_lst,market_type)
        if market: 
            result[bookmaker] = market 
    return result


def decimal_to_american(odds):
    if odds > 2.0:
        return f"+{int((odds - 1) * 100)}"
    elif odds == 2.0:
        return "+100"
    else:
        return str(int(-100 / (odds - 1)))

def format_datetime(timestamp):
    utc_time = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%SZ')
    est_time = utc_time - timedelta(hours=4)  # Adjust for Eastern Standard Time
    return est_time.strftime('%B %d, %Y %H:%M')


def american_to_probability(american_odds):
    """Convert American odds to implied probability."""
    if american_odds > 0:
        return (100 / (american_odds + 100)) * 100
    else:
        return (-american_odds / (-american_odds + 100)) * 100
    
def format_american_odds(american_odds):
    """Format American odds to include a '+' sign for positive values."""
    if american_odds > 0:
        return f"+{american_odds}"
    return str(american_odds)

def format_point(point, market_type):
    """Format point values to include a '+' sign for positive values, except for totals."""
    try:
        point_val = float(point)
        if market_type != 'totals':
            if point_val > 0:
                return f"+{point}"
        return str(point)
    except ValueError:
        return point  # Return the point as is if it's not a number

def process_games(games):
    quota_sum = 0 
    processed_games = []
    print(f"\nProcessing {len(games)} games")
    
    for game in games:
        # Check if 'commence_time' is present and if 'game' is a dictionary
        if not isinstance(game, dict) or 'commence_time' not in game:
            print(f"Skipping invalid game data: {game}")
            continue
        
        commence_time = datetime.fromisoformat(game['commence_time'][:-1]).replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)   
        if commence_time > now: 
            print(f"\nProcessing game: {game['home_team']} vs {game['away_team']}")
            game['formatted_markets'] = []
            game['commence_time'] = format_datetime(game['commence_time'])
            
            # Debug bookmaker data
            print(f"Available bookmakers: {[b['key'] for b in game['bookmakers']]}")
            
            my_book_markets = {
                book: [market for bookmaker in game['bookmakers'] if bookmaker['key'] == book for market in bookmaker['markets']]
                for book in my_bookmakers
            }
            pinnacle_markets = [market for bookmaker in game['bookmakers'] if bookmaker['key'] == 'pinnacle' for market in bookmaker['markets']]
            
            print(f"Found markets for my books: {[k for k, v in my_book_markets.items() if v]}")
            print(f"Found {len(pinnacle_markets)} Pinnacle markets")
            
            for market_key in ['h2h','spreads','totals']:
                books_for_curr_market = get_markets_by_type(my_book_markets, market_key)
                pinnacle_data = match_market(pinnacle_markets,market_key)
                
                if books_for_curr_market and pinnacle_data:
                    print(f"Found {market_key} market")
                    formatted_market = {'type': market_key, 'data': []}
                    best_odds = get_best_odds(books_for_curr_market)
                    
                    for my_outcome, p_outcome in zip(best_odds, pinnacle_data['outcomes']):
                        my_american = format_american_odds(my_outcome['price'])
                        p_american = format_american_odds(p_outcome['price'])
                        my_point = format_point(my_outcome['point'], market_key) if my_outcome['point'] is not None else ''
                        p_point = format_point(p_outcome.get('point', ''), market_key) if 'point' in p_outcome else ''
                        my_prob = american_to_probability(int(my_outcome['price']))
                        p_prob = american_to_probability(int(p_outcome['price']))
                        pct_edge = round(p_prob - my_prob,2)
                        
                        print(f"Processing {market_key}: {my_outcome['name']} - Edge: {pct_edge}%")
                        
                        # Always add the market, but mark if there's no edge
                        market_data = {
                            'name': my_outcome['name'],
                            'my_book': my_american,
                            'pinnacle': p_american,
                            'my_point': my_point,
                            'p_point': p_point,
                            'book_name': my_outcome['sportsbook'],
                            'pct_edge': pct_edge,
                            'has_edge': pct_edge >= 0.5  # Lower threshold to 0.5%
                        }
                        
                        # For spreads and totals, check alternate lines if points differ
                        if market_key in ['spreads', 'totals'] and float(my_point) != float(p_point):
                            alt_line, quota_last_used = check_alt_line(game['id'],'alternate_'+market_key,game['sport_key'], my_outcome)
                            quota_sum += quota_last_used
                            if alt_line is not None:
                                pct_edge = round(american_to_probability(int(alt_line['price'])) - my_prob,2)
                                market_data.update({
                                    'pinnacle': alt_line['price'],
                                    'p_point': alt_line['point'],
                                    'pct_edge': pct_edge,
                                    'has_edge': pct_edge >= 0.5
                                })
                        
                        formatted_market['data'].append(market_data)
                    
                    if formatted_market['data']:
                        game['formatted_markets'].append(formatted_market)
                else:
                    print(f"No {market_key} market found")
                    if not books_for_curr_market:
                        print(f"Missing {market_key} market in my books")
                    if not pinnacle_data:
                        print(f"Missing {market_key} market in Pinnacle")

            if game['formatted_markets']:
                processed_games.append(game)
                print(f"Added game with {len(game['formatted_markets'])} markets")
            else:
                print("No valid markets found for this game")

    print(f"Processed {len(processed_games)} games with valid markets")
    return processed_games, quota_sum


def fetch_odds(sport_key):
    url = f'https://api.the-odds-api.com/v4/sports/{sport_key}/odds'
    params = {
        "apiKey": THE_ODDS_API_KEY,
        "bookmakers": ','.join(my_bookmakers + sharp_bookmakers),
        "markets": "h2h,spreads,totals",
        "oddsFormat": "american"
    }
    
    print(f"\nFetching odds for {sport_key}")
    print(f"URL: {url}")
    print(f"Bookmakers: {params['bookmakers']}")
    
    response = requests.get(url, params=params)
    quota_used = int(response.headers._store.get('x-requests-last')[1])
    time.sleep(1)
    
    if response.status_code == 200:
        games = response.json()
        print(f"Received {len(games)} games for {sport_key}")
        if games:
            print(f"Sample game structure: {games[0]}")
            print(f"Sample game bookmakers: {games[0].get('bookmakers', [])}")
    else:
        print(f"Failed to retrieve data for {sport_key}: {response.status_code}")
        print(f"Response text: {response.text}")
        raise Exception(f"Failed to retrieve data: {response.status_code} - {response.text}")
    
    # Filter out games that have already commenced using list comprehension
    current_time = datetime.now(timezone.utc)
    filtered_games = [game for game in games if datetime.strptime(game['commence_time'], "%Y-%m-%dT%H:%M:%S%z") > current_time]
    print(f"Filtered to {len(filtered_games)} upcoming games for {sport_key}")
    
    with open('data/curr_data.json', 'w') as f: 
       json.dump(games,f)
    return filtered_games, quota_used

    
def main():
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        # Fetch data for all sports
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
        logger.info(f"Starting to fetch data for sports: {sports}")
        
        all_data = {}
        for sport in sports:
            logger.info(f"Processing sport: {sport}")
            try:
                games, quota_used = fetch_odds(sport)
                if games:
                    all_data[sport] = games
                    logger.info(f"Successfully fetched data for {sport}")
            except Exception as e:
                logger.error(f"Error fetching data for {sport}: {str(e)}")
                continue
        
        # Create output directory if it doesn't exist
        output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        os.makedirs(output_dir, exist_ok=True)
        
        # Save raw data to curr_data.json
        output_file = os.path.join(output_dir, 'curr_data.json')
        with open(output_file, 'w') as f:
            json.dump(all_data, f, indent=2)
            
        logger.info("Raw data saved to curr_data.json")
        
        # Now process the data and save to processed_games.json
        processed_data = {}
        for sport, games in all_data.items():
            try:
                logger.info(f"Processing games for {sport}")
                processed_games, _ = process_games(games)
                processed_data[sport] = processed_games
                logger.info(f"Processed {len(processed_games)} games for {sport}")
            except Exception as e:
                logger.error(f"Error processing games for {sport}: {str(e)}")
                processed_data[sport] = []
                
        # Add timestamp
        processed_data['last_update'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Save processed data to processed_games.json
        processed_file = os.path.join(output_dir, 'processed_games.json')
        with open(processed_file, 'w') as f:
            json.dump(processed_data, f, indent=2)
            
        logger.info("Processed data saved to processed_games.json")
            
    except Exception as e:
        logger.error(f"Error in main execution: {e}")
        raise

if __name__ == "__main__":
    main()