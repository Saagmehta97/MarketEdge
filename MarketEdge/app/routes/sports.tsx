import { useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";
import SportTabs from "../components/SportTabs";
import { useState, useEffect } from "react";

// Define types for our data
interface OddsData {
  name: string;
  my_book: string;
  pinnacle: string;
  my_point?: string;
  p_point?: string;
  book_name: string;
  pct_edge: number;
  has_edge: boolean;
}

interface MarketData {
  type: string;
  data: OddsData[];
}

type GameType = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  formatted_markets: MarketData[];
  isStarred?: boolean;
};

type LoaderData = {
  games: GameType[];
  sport: string;
  availableSports: string[];
};

// Configuration for our backend API
const API_CONFIG = {
  // Use environment variables or fallback to localhost
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  endpoints: {
    sports: "/sports",
    events: "/events"
  }
};

// Loader function to fetch data server-side
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const sport = url.searchParams.get("sport")?.toLowerCase() || "all";
  
  try {
    // Fetch available sports from our backend
    const sportsResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sports}`);
    
    if (!sportsResponse.ok) {
      throw new Error(`Failed to fetch sports: ${sportsResponse.status}`);
    }
    
    const availableSports = await sportsResponse.json();
    
    // Fetch events for the selected sport
    const eventsUrl = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}`);
    eventsUrl.searchParams.append("sport", sport);
    
    const eventsResponse = await fetch(eventsUrl.toString());
    
    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
    }
    
    // Get the data from the backend
    const backendGames = await eventsResponse.json();
    
    console.log("Games fetched from backend:", backendGames);
    
    // Transform the data to match what our frontend expects
    const games = backendGames.map((game: any) => {
      // Create formatted_markets array from the odds object
      const formatted_markets: MarketData[] = [];
      
      if (game.odds) {
        // Add moneyline
        if (game.odds.moneyline) {
          formatted_markets.push({
            type: 'h2h',
            data: [
              {
                name: game.homeTeam,
                my_book: String(game.odds.moneyline.home),
                pinnacle: String(game.odds.moneyline.home - 10), // Simulating Pinnacle odds
                book_name: 'DraftKings',
                pct_edge: 1.2, // Sample edge
                has_edge: game.odds.moneyline.home < -200, // Sample logic for edge
              },
              {
                name: game.awayTeam,
                my_book: String(game.odds.moneyline.away),
                pinnacle: String(game.odds.moneyline.away - 5), // Simulating Pinnacle odds
                book_name: 'FanDuel',
                pct_edge: 0.8, // Sample edge
                has_edge: game.odds.moneyline.away > 200, // Sample logic for edge
              }
            ]
          });
        }
        
        // Add spread
        if (game.odds.spread) {
          formatted_markets.push({
            type: 'spreads',
            data: [
              {
                name: game.homeTeam,
                my_book: String(game.odds.spread.home),
                pinnacle: String(game.odds.spread.home - 2), // Simulating Pinnacle odds
                my_point: String(game.odds.spread.points),
                p_point: String(game.odds.spread.points),
                book_name: 'BetMGM',
                pct_edge: -1.16,
                has_edge: false,
              },
              {
                name: game.awayTeam,
                my_book: String(game.odds.spread.away),
                pinnacle: String(game.odds.spread.away - 3), // Simulating Pinnacle odds
                my_point: String(-1 * game.odds.spread.points),
                p_point: String(-1 * game.odds.spread.points),
                book_name: 'Pinnacle',
                pct_edge: -1.16,
                has_edge: false,
              }
            ]
          });
        }
        
        // Add totals
        if (game.odds.total) {
          formatted_markets.push({
            type: 'totals',
            data: [
              {
                name: 'Over',
                my_book: String(game.odds.total.over),
                pinnacle: String(game.odds.total.over - 4), // Simulating Pinnacle odds
                my_point: String(game.odds.total.points),
                p_point: String(game.odds.total.points),
                book_name: 'BetMGM',
                pct_edge: 3.88,
                has_edge: true,
              },
              {
                name: 'Under',
                my_book: String(game.odds.total.under),
                pinnacle: String(game.odds.total.under - 2), // Simulating Pinnacle odds
                my_point: String(game.odds.total.points),
                p_point: String(game.odds.total.points),
                book_name: 'Pinnacle',
                pct_edge: -1.4,
                has_edge: false,
              }
            ]
          });
        }
      }
      
      return {
        id: game.id,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        startTime: game.startTime,
        formatted_markets,
        isStarred: game.isStarred
      };
    });
    
    if (games.length > 0) {
      console.log("Transformed game data:", JSON.stringify(games[0], null, 2));
    }
    
    return json<LoaderData>({ games, sport, availableSports });
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return empty arrays if there's an error
    return json<LoaderData>({ games: [], sport, availableSports: [] });
  }
};

export default function Sports() {
  const { games, sport, availableSports } = useLoaderData<LoaderData>();
  const [isLiveOnly, setIsLiveOnly] = useState(false);
  const [showOnlyEdges, setShowOnlyEdges] = useState(true);
  const [filteredGames, setFilteredGames] = useState<GameType[]>(games);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const fetcher = useFetcher<LoaderData>();
  
  // Log the game data structure to debug
  useEffect(() => {
    console.log("Games from backend:", games);
    if (games.length > 0) {
      console.log("First game structure:", JSON.stringify(games[0], null, 2));
      // Check structure of the first game to debug
      const game = games[0];
      console.log("Game properties:");
      console.log("id:", game.id);
      console.log("homeTeam:", game.homeTeam);
      console.log("awayTeam:", game.awayTeam);
      console.log("startTime:", game.startTime);
      console.log("Odds structure:", game.formatted_markets);
    } else {
      console.log("No games returned from backend");
    }
  }, [games]);
  
  // Auto-refresh data every 30 seconds when enabled
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isAutoRefresh) {
      intervalId = setInterval(() => {
        const url = sport === "all" ? "/sports" : `/sports?sport=${sport}`;
        fetcher.load(url);
      }, 30000); // refresh every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sport, isAutoRefresh, fetcher]);
  
  // Update games when fetcher returns new data
  useEffect(() => {
    if (fetcher.data?.games) {
      let newGames = fetcher.data.games;
      
      if (isLiveOnly) {
        // In a real app, you would filter based on an isLive property
        newGames = newGames.filter((_game, index) => index % 2 === 0);
      }
      
      if (showOnlyEdges) {
        // Filter to only show games that have at least one edge
        newGames = newGames.filter(game => {
          return game.formatted_markets && game.formatted_markets.some(market => 
            market.data && market.data.some(odds => odds.has_edge)
          );
        });
      }
      
      setFilteredGames(newGames);
    }
  }, [fetcher.data, isLiveOnly, showOnlyEdges]);
  
  // Filter games when filters change or games change
  useEffect(() => {
    let newFilteredGames = [...games];
    
    if (isLiveOnly) {
      // In a real app, you would filter based on an isLive property
      newFilteredGames = newFilteredGames.filter((_game, index) => index % 2 === 0);
    }
    
    if (showOnlyEdges) {
      // Filter to only show games that have at least one edge
      newFilteredGames = newFilteredGames.filter(game => {
        return game.formatted_markets && game.formatted_markets.some(market => 
          market.data && market.data.some(odds => odds.has_edge)
        );
      });
    }
    
    setFilteredGames(newFilteredGames);
  }, [games, isLiveOnly, showOnlyEdges]);
  
  // Handle starring/following an event
  const handleToggleFollow = async (gameId: string, isCurrentlyStarred: boolean) => {
    try {
      const endpoint = isCurrentlyStarred ? 'unstar' : 'star';
      const response = await fetch(`${API_CONFIG.baseUrl}/events/${gameId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} event: ${response.status}`);
      }
      
      // Update the local state to reflect the change
      setFilteredGames(prev => 
        prev.map(game => 
          game.id === gameId 
            ? { ...game, isStarred: !isCurrentlyStarred } 
            : game
        )
      );
      
    } catch (error) {
      console.error(`Error toggling follow status for game ${gameId}:`, error);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-olive mb-4">Sports Betting Odds</h1>
        
        <div className="flex items-center space-x-6 mb-4">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="form-checkbox text-olive h-5 w-5" 
              checked={isLiveOnly}
              onChange={(e) => setIsLiveOnly(e.target.checked)}
            />
            <span>Show Live Games</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="form-checkbox text-olive h-5 w-5" 
              checked={showOnlyEdges}
              onChange={(e) => setShowOnlyEdges(e.target.checked)}
            />
            <span>Show Only Games with Edges</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="form-checkbox text-olive h-5 w-5" 
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh Odds</span>
          </label>
          
          {fetcher.state === "loading" && (
            <span className="text-sm text-gray-500">Refreshing odds...</span>
          )}
        </div>
        
        <SportTabs activeSport={sport} availableSports={availableSports} />
      </div>

      <div className="space-y-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game, index) => (
            <GameCard 
              key={index} 
              {...game} 
              onToggleFollow={() => handleToggleFollow(game.id, Boolean(game.isStarred))}
            />
          ))
        ) : (
          <div className="bg-blue-100 text-blue-700 p-4 rounded">
            {showOnlyEdges ? 
              "No games with betting edges available for this sport at the moment." :
              "No games available for this sport at the moment."}
          </div>
        )}
      </div>
    </div>
  );
} 