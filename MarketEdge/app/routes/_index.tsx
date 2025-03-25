import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "MarketEdge - Sports Betting Odds" },
    { name: "description", content: "Find the best sports betting odds and arbitrage opportunities" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-olive mb-6">Welcome to MarketEdge</h1>
        <p className="text-xl text-gray-700 mb-8">
          Discover betting opportunities across multiple sports with real-time odds comparison.
        </p>
        <Link 
          to="/sports" 
          className="inline-block bg-olive hover:bg-olive-light text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          View Sports Events
        </Link>
      </div>
    </div>
  );
}


