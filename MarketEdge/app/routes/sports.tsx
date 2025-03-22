import { useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";
import SportTabs from "../components/SportTabs";
import { useState, useEffect } from "react";

// Define types for our data
type OddsType = {
  moneyline: { home: number; away: number };
  spread: { home: number; away: number; points: number };
  total: { over: number; under: number; points: number };
};

type GameType = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  odds: OddsType;
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
    
    const games = await eventsResponse.json();
    
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
  const [filteredGames, setFilteredGames] = useState<GameType[]>(games);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const fetcher = useFetcher<LoaderData>();
  
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
      setFilteredGames(
        isLiveOnly 
          ? fetcher.data.games.filter((_game, index) => index % 2 === 0)
          : fetcher.data.games
      );
    }
  }, [fetcher.data, isLiveOnly]);
  
  // Filter games when live-only toggle changes or games change
  useEffect(() => {
    if (isLiveOnly) {
      // In a real app, you would filter based on an isLive property
      // This is a placeholder for demonstration
      setFilteredGames(games.filter((_game, index) => index % 2 === 0)); // Just a sample filter
    } else {
      setFilteredGames(games);
    }
  }, [games, isLiveOnly]);
  
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
            No games available for this sport at the moment.
          </div>
        )}
      </div>
    </div>
  );
} 