import { useState, useEffect } from 'react';

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
                <div className="col-span-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Home Team/Over Side */}
                    <div>
                      <div className="grid grid-cols-3 gap-1">
                        {/* Team/Option Name centered only over first two columns */}
                        <div className="col-span-2 mb-2">
                          <div className="font-medium text-center">
                            {marketType === 'totals' 
                              ? `Over ${market.data[0]?.my_point}` 
                              : `${market.data[0]?.name} ${market.data[0]?.my_point || ''}`}
                          </div>
                        </div>
                        
                        {/* Edge Label - only show for the first market type (moneyline) */}
                        <div className="text-center text-xs text-gray-600 mb-2">
                          {marketType === 'h2h' ? 'Edge %' : ''}
                        </div>
                      </div>
                      
                      {/* Column Headers */}
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        <div className="text-center text-xs text-gray-600">{market.data[0]?.book_name || 'Book'}</div>
                        <div className="text-center text-xs text-gray-600">Pinnacle</div>
                        <div className="text-center text-xs text-gray-600"></div>
                      </div>
                      
                      {/* Odds Values */}
                      <div className="grid grid-cols-3 gap-1">
                        {/* Bookmaker odds */}
                        <div className="flex items-center justify-center border rounded px-2 py-1">
                          <span className="mr-1">{formatOdds(market.data[0]?.my_book)}</span>
                          <img
                            src={getBookmakerLogo(market.data[0]?.book_name)}
                            alt={market.data[0]?.book_name}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        
                        {/* Pinnacle odds */}
                        <div className="flex items-center justify-center border rounded px-2 py-1">
                          <span className="mr-1">{formatOdds(market.data[0]?.pinnacle)}</span>
                          <img
                            src="/img/pinnacle_logo.jpg"
                            alt="Pinnacle"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        
                        {/* Edge percentage */}
                        <div className={`flex items-center justify-center rounded px-2 py-1 ${
                          parseFloat(market.data[0]?.pct_edge.toString()) > 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {formatEdge(market.data[0]?.pct_edge)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Away Team/Under Side */}
                    <div>
                      <div className="grid grid-cols-3 gap-1">
                        {/* Team/Option Name centered only over first two columns */}
                        <div className="col-span-2 mb-2">
                          <div className="font-medium text-center">
                            {marketType === 'totals' 
                              ? `Under ${market.data[1]?.my_point}` 
                              : `${market.data[1]?.name} ${market.data[1]?.my_point || ''}`}
                          </div>
                        </div>
                        
                        {/* Edge Label - only show for the first market type (moneyline) */}
                        <div className="text-center text-xs text-gray-600 mb-2">
                          {marketType === 'h2h' ? 'Edge %' : ''}
                        </div>
                      </div>
                      
                      {/* Column Headers */}
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        <div className="text-center text-xs text-gray-600">{market.data[1]?.book_name || 'Book'}</div>
                        <div className="text-center text-xs text-gray-600">Pinnacle</div>
                        <div className="text-center text-xs text-gray-600"></div>
                      </div>
                      
                      {/* Odds Values */}
                      <div className="grid grid-cols-3 gap-1">
                        {/* Bookmaker odds */}
                        <div className="flex items-center justify-center border rounded px-2 py-1">
                          <span className="mr-1">{formatOdds(market.data[1]?.my_book)}</span>
                          <img
                            src={getBookmakerLogo(market.data[1]?.book_name)}
                            alt={market.data[1]?.book_name}
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        
                        {/* Pinnacle odds */}
                        <div className="flex items-center justify-center border rounded px-2 py-1">
                          <span className="mr-1">{formatOdds(market.data[1]?.pinnacle)}</span>
                          <img
                            src="/img/pinnacle_logo.jpg"
                            alt="Pinnacle"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        
                        {/* Edge percentage */}
                        <div className={`flex items-center justify-center rounded px-2 py-1 ${
                          parseFloat(market.data[1]?.pct_edge.toString()) > 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {formatEdge(market.data[1]?.pct_edge)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>No odds data available for this game</p>
          <p className="text-xs mt-2">Check if the formatted_markets property is correctly passed</p>
        </div>
      )}
    </div>
  );
} 