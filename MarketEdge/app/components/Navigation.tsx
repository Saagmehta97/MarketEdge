import { Link } from "@remix-run/react";

export default function Navigation() {
  return (
    <nav className="fixed h-screen w-64 bg-black text-white p-6 flex flex-col overflow-y-auto">
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold mb-8 text-white">MarketEdge</h1>
        
        <button
          className="w-full bg-olive hover:bg-olive-light text-white font-bold py-2 px-4 rounded transition-colors mb-6"
          onClick={() => {/* TODO: Implement login logic */}}
        >
          Login
        </button>
        
        <div className="space-y-4">
          <Link to="/sports" className="block hover:text-olive-light transition-colors">
            Home
          </Link>
          <Link to="/favorites" className="block hover:text-olive-light transition-colors">
            Followed Events
          </Link>
        </div>
      </div>
    </nav>
  );
} 