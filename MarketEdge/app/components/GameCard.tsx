import { useState, useEffect } from 'react';
import React from 'react';

// Updated interface for detailed odds with bookmaker info
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

interface GameCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  formatted_markets: MarketData[];
  isStarred?: boolean;
  onToggleFollow?: () => void;
}

export default function GameCard({ 
  id, 
  homeTeam, 
  awayTeam, 
  startTime, 
  formatted_markets = [],
  isStarred = false,
  onToggleFollow 
}: GameCardProps) {
  // Start with the prop value
  const [isFollowed, setIsFollowed] = useState(isStarred);
  
  // Sync with isStarred prop changes
  useEffect(() => {
    if (isStarred !== isFollowed) {
      setIsFollowed(isStarred);
    }
  }, [isStarred, isFollowed]);
  
  // Handle button click
  function handleFollowClick() {
    // Toggle the followed state
    const newState = !isFollowed;
    setIsFollowed(newState);
    
    // Call parent handler if provided
    if (onToggleFollow) {
      onToggleFollow();
    }
  }

  // Get logo path for a bookmaker
  const getBookmakerLogo = (bookName: string) => {
    const normalizedName = bookName.toLowerCase().replace(/\s+/g, '');
    
    switch (normalizedName) {
      case 'draftkings':
        return '/img/draftkings_logo.jpg';
      case 'fanduel':
        return '/img/fanduel_logo.jpg';
      case 'pinnacle':
        return '/img/pinnacle_logo.jpg';
      case 'betmgm':
        return '/img/betmgm_logo.jpg';
      case 'espnbet':
        return '/img/espnbet_logo.jpg';
      case 'fliff':
        return '/img/fliff_logo.jpg';
      case 'williamhill':
      case 'williamhillus':
        return '/img/williamhill_us_logo.jpg';
      default:
        return '/img/betmgm_logo.jpg'; // Fallback to a known logo
    }
  };

  // Helper to format the market type name
  const getMarketName = (type: string) => {
    switch (type) {
      case 'h2h': return 'Moneyline';
      case 'spreads': return 'Spreads';
      case 'totals': return 'Totals';
      default: return type;
    }
  };
  
  // Helper to format edge percentage with + for positive numbers
  const formatEdge = (pctEdge: number) => {
    return pctEdge > 0 ? `+${pctEdge.toFixed(2)}` : pctEdge.toFixed(2);
  };
  
  // Helper to format odds value with + for positive numbers
  const formatOdds = (odds: string | number) => {
    const oddsNum = parseInt(odds?.toString() || '0', 10);
    return oddsNum > 0 ? `+${oddsNum}` : `${oddsNum}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-olive">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{awayTeam} @ {homeTeam}</h3>
          <p className="text-gray-600">Start Time: {startTime}</p>
        </div>
        <button 
          id={`follow-button-${id}`}
          onClick={handleFollowClick}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            isFollowed 
              ? 'bg-olive text-white' 
              : 'border-2 border-olive text-olive hover:bg-olive hover:text-white'
          }`}
          data-id={id}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      </div>

      {formatted_markets.length > 0 ? (
        <div className="mt-4">
          {/* All Market Types (Moneyline, Spreads, Totals) */}
          {['h2h', 'spreads', 'totals'].map(marketType => {
            const market = formatted_markets.find(m => m.type === marketType);
            if (!market) return null;
            
            return (
              <div key={marketType} className="grid grid-cols-7 gap-2 mb-4">
                {/* Market Type Label (Left Side) */}
                <div className="col-span-1 flex items-center font-medium">
                  {getMarketName(marketType)}
                </div>
                
                {/* Odds Data (Right Side) */}
                <div className="col-span-6 grid grid-cols-3 gap-4">
                  {market.data.map((odds, index) => (
                    <div 
                      key={`${odds.name}-${index}`} 
                      className={`border rounded-lg p-3 ${odds.has_edge ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium">{odds.name}</div>
                        {odds.has_edge && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                            {formatEdge(odds.pct_edge)}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-1">
                          <img 
                            src={getBookmakerLogo(odds.book_name)} 
                            alt={odds.book_name} 
                            className="w-6 h-6 object-cover rounded-full"
                          />
                          <span className="text-lg font-bold">{formatOdds(odds.my_book)}</span>
                        </div>
                        
                        {marketType === 'spreads' && odds.my_point && (
                          <span className="text-sm text-gray-600">{odds.my_point}</span>
                        )}
                        {marketType === 'totals' && odds.my_point && (
                          <span className="text-sm text-gray-600">{odds.my_point}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <img 
                            src={getBookmakerLogo('pinnacle')} 
                            alt="Pinnacle" 
                            className="w-5 h-5 object-cover rounded-full opacity-70"
                          />
                          <span>{formatOdds(odds.pinnacle)}</span>
                        </div>
                        
                        {marketType === 'spreads' && odds.p_point && (
                          <span>{odds.p_point}</span>
                        )}
                        {marketType === 'totals' && odds.p_point && (
                          <span>{odds.p_point}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded mt-4">
          <p className="text-gray-500">No odds data available</p>
        </div>
      )}
    </div>
  );
} 