import { useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";
import SportTabs from "../components/SportTabs";
import { useState, useEffect } from "react";
import { createdSharedLoader } from "./utils/loaders";
import { sharedAction } from "./utils/actions"


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

export interface MarketData {
  type: string;
  data: OddsData[];
}

export type GameType = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  formatted_markets: MarketData[];
  isFollowed?: boolean;
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
    events: "/events",
    follow: "/follow"
  }
};

//takes form data and does python server call
export const action = sharedAction
// Loader function to fetch data server-side
export const loader = createdSharedLoader(false)


export default function Sports() {
  const { games, sport, availableSports } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<LoaderData>();

  // State for UI filters and game display
  const [filteredGames, setFilteredGames] = useState<GameType[]>(games);
  const [isLiveOnly, setIsLiveOnly] = useState(false);
  const [showOnlyEdges, setShowOnlyEdges] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  
  // Initialize filteredGames with games from the loader
  useEffect(() => {
    setFilteredGames(games);
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
      let newGames = fetcher.data.games as GameType[];
      
      // Apply filters
      if (isLiveOnly) {
        // In a real app, you would filter based on an isLive property
        newGames = newGames.filter((_game: GameType, index: number) => index % 2 === 0);
      }
      
      if (showOnlyEdges) {
        // Filter to only show games that have at least one edge
        newGames = newGames.filter((game: GameType) => {
          return game.formatted_markets && game.formatted_markets.some((market: MarketData) => 
            market.data && market.data.some((odds: OddsData) => odds.has_edge)
          );
        });
      }
      
      setFilteredGames(newGames);
    }
  }, [fetcher.data, isLiveOnly, showOnlyEdges]);
  
  // Filter games when filters change or games change
  useEffect(() => {
    // Start with games
    let newFilteredGames = [...games];
    
    // Apply filters
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
  const handleToggleFollow = (gameId: string) => {
    // Find the game
    const gameToToggle = filteredGames.find(game => game.id === gameId);
    if (!gameToToggle) {
      return;
    }
    
    // Get the current state and toggle it
    const currentStarred = !!gameToToggle.isFollowed;
    const newStarred = !currentStarred;
    
    // Update the isFollowed property in our filteredGames state
    setFilteredGames(prev => {
      const updated = prev.map(game => 
        game.id === gameId 
          ? { ...game, isFollowed: newStarred } 
          : game
      );
      return updated;
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-olive mb-4">MarketEdge</h1>
        
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
          filteredGames.map((game) => (
            <GameCard 
              key={`game-${game.id}`} 
              id={game.id}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              startTime={game.startTime}
              formatted_markets={game.formatted_markets}
              isFollowed={!!game.isFollowed}
              onToggleFollow={() => handleToggleFollow(game.id)}
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