import { Link } from "@remix-run/react";

type SportTabsProps = {
  activeSport: string;
  availableSports?: string[];
};

// Sport name mapping for display purposes
const SPORT_DISPLAY_NAMES: Record<string, string> = {
  "baseball_mlb": "MLB",
  "americanfootball_nfl": "NFL",
  "basketball_nba": "NBA",
  "basketball_wnba": "WNBA",
  "americanfootball_ncaaf": "NCAAF",
  "mma_mixed_martial_arts": "MMA",
  "tennis_atp_us_open": "Men's Tennis",
  "tennis_wta_us_open": "Women's Tennis",
  "baseball_kbo": "KBO",
  "baseball_npb": "NPB"
};

export default function SportTabs({ activeSport, availableSports = [] }: SportTabsProps) {
  // Use provided availableSports or fallback to default sports list
  let sports = availableSports.length > 0
    ? availableSports.map(sportId => ({
        id: sportId,
        name: SPORT_DISPLAY_NAMES[sportId] || sportId // Use mapping or fallback to ID
      }))
    : [
        { id: "basketball_nba", name: "NBA" },
        { id: "baseball_mlb", name: "MLB" },
        { id: "americanfootball_nfl", name: "NFL" },
        { id: "basketball_wnba", name: "WNBA" },
        { id: "americanfootball_ncaaf", name: "NCAAF" },
        { id: "mma_mixed_martial_arts", name: "MMA" },
        { id: "tennis_atp_us_open", name: "Men's Tennis" },
        { id: "tennis_wta_us_open", name: "Women's Tennis" }
      ];
      
  // If we have availableSports, reorder to put NBA first
  if (availableSports.length > 0) {
    // First extract NBA from the list if it exists
    const nbaIndex = sports.findIndex(sport => sport.id === "basketball_nba");
    if (nbaIndex !== -1) {
      const nba = sports.splice(nbaIndex, 1)[0];
      // Then reinsert it at the beginning
      sports.unshift(nba);
    }
  }

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-2 overflow-x-auto pb-1">
        <Link
          to="/sports"
          className={`inline-block px-4 py-2 rounded-t-lg transition-colors ${
            activeSport === "all"
              ? "bg-olive text-white font-medium"
              : "hover:bg-gray-200 text-gray-600"
          }`}
        >
          All
        </Link>

        {sports.map((sport) => (
          <Link
            key={sport.id}
            to={`/sports?sport=${sport.id}`}
            className={`inline-block px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
              activeSport === sport.id
                ? "bg-olive text-white font-medium"
                : "hover:bg-gray-200 text-gray-600"
            }`}
          >
            {sport.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 