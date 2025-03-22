import { useState, useEffect } from 'react';

interface GameCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  odds: {
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
  };
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

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="border-r border-gray-200 pr-4">
          <h4 className="text-sm font-semibold text-gray-600">Moneyline</h4>
          <div className="mt-1">
            <p>{homeTeam}: {formatOdds(odds.moneyline.home)}</p>
            <p>{awayTeam}: {formatOdds(odds.moneyline.away)}</p>
          </div>
        </div>
        
        <div className="border-r border-gray-200 px-4">
          <h4 className="text-sm font-semibold text-gray-600">Spread</h4>
          <div className="mt-1">
            <p>{homeTeam}: {formatPoint(odds.spread.points)} ({formatOdds(odds.spread.home)})</p>
            <p>{awayTeam}: {formatPoint(-odds.spread.points)} ({formatOdds(odds.spread.away)})</p>
          </div>
        </div>
        
        <div className="pl-4">
          <h4 className="text-sm font-semibold text-gray-600">Total</h4>
          <div className="mt-1">
            <p>Over {odds.total.points}: {formatOdds(odds.total.over)}</p>
            <p>Under {odds.total.points}: {formatOdds(odds.total.under)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format American odds with + sign when positive
function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

// Helper function to format point spreads with + sign when positive
function formatPoint(point: number): string {
  return point > 0 ? `+${point}` : `${point}`;
} 