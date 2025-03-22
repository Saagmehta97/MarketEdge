import type { MetaFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";
import SportsList from "~/components/SportsList"

export const meta: MetaFunction = () => {
  return [
    { title: "MarketEdge - Sports Betting Odds" },
    { name: "description", content: "Find the best sports betting odds and arbitrage opportunities" },
  ];
};

const sampleGames = [
  {
    homeTeam: "Oklahoma City Thunder",
    awayTeam: "Charlotte Hornets",
    startTime: "March 21, 2025 20:10",
    odds: {
      moneyline: {
        home: -2200,
        away: 1300
      },
      spread: {
        home: -105,
        away: -110,
        points: 20.5
      },
      total: {
        over: -108,
        under: -105,
        points: 220.5
      }
    }
  },
  {
    homeTeam: "Miami Heat",
    awayTeam: "Houston Rockets",
    startTime: "March 21, 2025 20:10",
    odds: {
      moneyline: {
        home: 160,
        away: -178
      },
      spread: {
        home: -105,
        away: -110,
        points: 4.5
      },
      total: {
        over: -108,
        under: -105,
        points: 215.5
      }
    }
  }
];

export default function Index() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-olive">Sports Betting Odds</h1>
        <div className="flex items-center space-x-4">
          <select className="border rounded-md py-2 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-olive">
            <option value="">Sport Select or All</option>
            <option value="NBA">NBA</option>
            <option value="NFL">NFL</option>
            <option value="MLB">MLB</option>
          </select>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox text-olive h-5 w-5" />
            <span>Show Live Games</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {sampleGames.map((game, index) => (
          <GameCard key={index} {...game} />
        ))}
      </div>
      <div className="space-y-4">
        <SportsList></SportsList>

      </div>
    </div>
  );
}


