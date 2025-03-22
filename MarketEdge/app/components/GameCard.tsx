import { useState } from 'react';

interface GameCardProps {
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
}

export default function GameCard({ homeTeam, awayTeam, startTime, odds }: GameCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-olive">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{awayTeam} @ {homeTeam}</h3>
          <p className="text-gray-600">Start Time: {startTime}</p>
        </div>
        <button
          onClick={() => setIsFollowing(!isFollowing)}
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
            <p>{homeTeam}: {odds.moneyline.home}</p>
            <p>{awayTeam}: {odds.moneyline.away}</p>
          </div>
        </div>
        
        <div className="border-r border-gray-200 px-4">
          <h4 className="text-sm font-semibold text-gray-600">Spread</h4>
          <div className="mt-1">
            <p>{homeTeam}: {odds.spread.points} ({odds.spread.home})</p>
            <p>{awayTeam}: {-odds.spread.points} ({odds.spread.away})</p>
          </div>
        </div>
        
        <div className="pl-4">
          <h4 className="text-sm font-semibold text-gray-600">Total</h4>
          <div className="mt-1">
            <p>Over {odds.total.points}: {odds.total.over}</p>
            <p>Under {odds.total.points}: {odds.total.under}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 