import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "MarketEdge - Sports Betting Odds" },
    { name: "description", content: "Find the best sports betting odds and arbitrage opportunities" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-olive mb-4">Welcome to MarketEdge</h1>
        <p className="text-xl text-gray-600">
          Your premier platform for sports betting odds and arbitrage opportunities
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose MarketEdge?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="bg-olive rounded-full p-2 mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Real-time Odds</h3>
              <p className="text-gray-600">Get the latest betting odds from multiple sportsbooks in real-time.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-olive rounded-full p-2 mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Edge Detection</h3>
              <p className="text-gray-600">Automatically identify profitable betting opportunities across markets.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-olive rounded-full p-2 mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Personalized Tracking</h3>
              <p className="text-gray-600">Follow your favorite teams and events for quick access.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-olive rounded-full p-2 mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Secure Platform</h3>
              <p className="text-gray-600">Your data is protected with industry-standard security practices.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">View all available sports and betting opportunities.</p>
        <button 
          onClick={() => navigate("/sports")}
          className="bg-olive hover:bg-olive-light text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          View Sports Events
        </button>
      </div>
    </div>
  );
}


