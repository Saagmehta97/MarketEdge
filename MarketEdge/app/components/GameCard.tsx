import { useState, useEffect } from 'react';

// Updated interface to match the backend API response
interface GameOdds {
  moneyline: {
    home: number;
    away: number;
  };
  spread: {
    home: number;
    away: number;
    points: number;
  };
  total: {
    over: number;
    under: number;
    points: number;
  };
}

interface GameCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  odds: GameOdds;
  isStarred?: boolean;
  onToggleFollow?: () => void;
}

export default function GameCard({ 
  id, 
  homeTeam, 
  awayTeam, 
  startTime, 
  odds,
  isStarred = false,
  onToggleFollow 
}: GameCardProps) {
  // Track local state of following, but sync with prop when it changes
  const [isFollowing, setIsFollowing] = useState(isStarred);
  
  useEffect(() => {
    setIsFollowing(isStarred);
  }, [isStarred]);

  const handleFollowClick = () => {
    // Update local state immediately for responsive UI
    setIsFollowing(!isFollowing);
    
    // Call the parent handler if provided
    if (onToggleFollow) {
      onToggleFollow();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-olive">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{awayTeam} @ {homeTeam}</h3>
          <p className="text-gray-600">Start Time: {startTime}</p>
        </div>
        <button
          onClick={handleFollowClick}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            isFollowing
              ? 'bg-olive text-white'
              : 'border-2 border-olive text-olive hover:bg-olive hover:text-white'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Check if odds exists */}
        {odds ? (
          <>
            {/* Moneyline */}
            {odds.moneyline && (
              <div className="border-t border-gray-200 pt-3 first:border-t-0 first:pt-0">
                <h4 className="text-sm font-bold uppercase text-gray-700 mb-2">Moneyline</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{homeTeam}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{odds.moneyline.home}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{awayTeam}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{odds.moneyline.away}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Spread */}
            {odds.spread && (
              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-bold uppercase text-gray-700 mb-2">Spread</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{homeTeam} {odds.spread.points}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{odds.spread.home}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{awayTeam} {-1 * odds.spread.points}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{odds.spread.away}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Totals */}
            {odds.total && (
              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-bold uppercase text-gray-700 mb-2">Total</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Over {odds.total.points}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{odds.total.over}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Under {odds.total.points}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{odds.total.under}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No odds data available for this game</p>
            <p className="text-xs mt-2">Check if the odds data is being correctly passed</p>
          </div>
        )}
      </div>
    </div>
  );
} 