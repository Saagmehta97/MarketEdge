import { useEffect, useState } from "react";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import GameCard from "~/components/GameCard";
import type { GameType } from "~/routes/sports";
import { createdSharedLoader, LoaderData } from "../utils/loaders";
import { sharedAction } from "../utils/actions";

// Configuration for our backend API
const API_CONFIG = {
  // Use environment variables or fallback to localhost
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  endpoints: {
    events: "/events"
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "My Favorites - MarketEdge" },
    { name: "description", content: "Your favorite betting opportunities" },
  ];
};

export const action = sharedAction

export const loader = createdSharedLoader(true)
export default function FavoritesIndex() {
  const { games, sport, availableSports } = useLoaderData<LoaderData>();
//   const [followedGames, setFollowedGames] = useState<GameType[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Fetch starred events from the API
//   const fetchStarredEvents = async () => {
//     setIsLoading(true);
    
//     try {
//       // Fetch from API
//       const eventsUrl = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}`);
//       eventsUrl.searchParams.append("followed", "true");
      
//       const response = await fetch(eventsUrl.toString());
      
//       if (response.ok) {
//         const apiGames = await response.json();
//         console.log("apiGames: ", apiGames)
        
//         if (apiGames.length > 0) {
//           setFollowedGames(apiGames);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching starred events:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     // Fetch starred events when component mounts
//     fetchStarredEvents();
  // }, []);
  
  // const handleToggleFollow = (gameId: string) => {
  //   // Remove the game from the UI immediately
  //   setFollowedGames(prevGames => {
  //     const updatedGames = prevGames.filter(game => game.id !== gameId);
  //     return updatedGames;
  //   });
  // };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      
      {/* {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">Loading your favorite games...</p>
        </div> */}
      { games.length > 0 ? (
        <div className="grid gap-6">
          {games.map(game => (
              <GameCard 
                key={`fav-${game.id}`}
                id={game.id}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                startTime={game.startTime}
                formatted_markets={game.formatted_markets || []}
                isFollowed={true}
                // onToggleFollow={() => handleToggleFollow(game.id)}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">You haven't followed any games yet.</p>
          <p className="text-gray-400 mt-2">Visit the Sports section and click "Follow" on games you're interested in.</p>
        </div>
      )}
    </div>
  );
} 