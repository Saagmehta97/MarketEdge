import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

// API Key would normally be stored in environment variables
const API_KEY = "your_api_key_here";

// Map our internal sport IDs to the API's sport IDs
const SPORT_ID_MAP: Record<string, string> = {
  nba: "basketball_nba",
  nfl: "americanfootball_nfl",
  mlb: "baseball_mlb",
  wnba: "basketball_wnba",
  ncaaf: "americanfootball_ncaaf",
  mma: "mma_mixed_martial_arts",
  "mens-tennis": "tennis_atp",
  "womens-tennis": "tennis_wta",
};

// Example API service: The Odds API (https://the-odds-api.com)
// You would replace this with your chosen sports API
async function fetchOddsFromAPI(sport: string) {
  const sportId = SPORT_ID_MAP[sport] || "basketball_nba";
  
  try {
    // This is just an example endpoint - replace with your actual API
    const url = `https://api.the-odds-api.com/v4/sports/${sportId}/odds/?apiKey=${API_KEY}&regions=us&markets=h2h,spreads,totals`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API data to match our application's format
    return data.map((event: any) => ({
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      startTime: new Date(event.commence_time).toLocaleString(),
      odds: {
        moneyline: {
          home: extractMoneylineOdds(event, event.home_team),
          away: extractMoneylineOdds(event, event.away_team)
        },
        spread: {
          home: extractSpreadOdds(event, event.home_team),
          away: extractSpreadOdds(event, event.away_team),
          points: extractSpreadPoints(event, event.home_team)
        },
        total: {
          over: extractTotalOdds(event, "over"),
          under: extractTotalOdds(event, "under"),
          points: extractTotalPoints(event)
        }
      }
    }));
  } catch (error) {
    console.error("Error fetching odds data:", error);
    return [];
  }
}

// Helper functions to extract odds from API response
function extractMoneylineOdds(event: any, team: string) {
  try {
    const h2hMarket = event.bookmakers[0].markets.find((m: any) => m.key === "h2h");
    const outcome = h2hMarket.outcomes.find((o: any) => o.name === team);
    return formatOddsAsAmerican(outcome.price);
  } catch (e) {
    return 0;
  }
}

function extractSpreadOdds(event: any, team: string) {
  try {
    const spreadMarket = event.bookmakers[0].markets.find((m: any) => m.key === "spreads");
    const outcome = spreadMarket.outcomes.find((o: any) => o.name === team);
    return formatOddsAsAmerican(outcome.price);
  } catch (e) {
    return 0;
  }
}

function extractSpreadPoints(event: any, team: string) {
  try {
    const spreadMarket = event.bookmakers[0].markets.find((m: any) => m.key === "spreads");
    const outcome = spreadMarket.outcomes.find((o: any) => o.name === team);
    return Math.abs(outcome.point);
  } catch (e) {
    return 0;
  }
}

function extractTotalOdds(event: any, type: string) {
  try {
    const totalsMarket = event.bookmakers[0].markets.find((m: any) => m.key === "totals");
    const outcome = totalsMarket.outcomes.find((o: any) => o.name === type);
    return formatOddsAsAmerican(outcome.price);
  } catch (e) {
    return 0;
  }
}

function extractTotalPoints(event: any) {
  try {
    const totalsMarket = event.bookmakers[0].markets.find((m: any) => m.key === "totals");
    return totalsMarket.outcomes[0].point;
  } catch (e) {
    return 0;
  }
}

function formatOddsAsAmerican(decimal: number) {
  // Convert decimal odds to American format
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  const sport = params.sport?.toLowerCase() || "all";
  
  // DEVELOPMENT MODE: Return mock data instead of making real API calls
  // IMPORTANT: Remove this block and uncomment the API call in production
  if (true) {
    // Sample data for development
    // In a real app, you would fetch this from an API
    const mockData = getSampleDataForSport(sport);
    return json(mockData);
  }
  
  // PRODUCTION MODE: Make actual API calls
  // Uncomment this for production use
  /*
  try {
    const games = await fetchOddsFromAPI(sport);
    return json(games);
  } catch (error) {
    console.error("Error in API route:", error);
    return json({ error: "Failed to fetch sports data" }, { status: 500 });
  }
  */
};

// Sample data for development
function getSampleDataForSport(sport: string) {
  const sampleData: Record<string, any[]> = {
    all: [],
    nba: [
      {
        homeTeam: "Oklahoma City Thunder",
        awayTeam: "Charlotte Hornets",
        startTime: "March 21, 2025 20:10",
        odds: {
          moneyline: { home: -2200, away: 1300 },
          spread: { home: -105, away: -110, points: 20.5 },
          total: { over: -108, under: -105, points: 220.5 }
        }
      },
      {
        homeTeam: "Miami Heat",
        awayTeam: "Houston Rockets",
        startTime: "March 21, 2025 20:10",
        odds: {
          moneyline: { home: 160, away: -178 },
          spread: { home: -105, away: -110, points: 4.5 },
          total: { over: -108, under: -105, points: 215.5 }
        }
      }
    ],
    nfl: [
      {
        homeTeam: "Kansas City Chiefs",
        awayTeam: "Buffalo Bills",
        startTime: "September 15, 2025 19:30",
        odds: {
          moneyline: { home: -150, away: 130 },
          spread: { home: -110, away: -110, points: 3.5 },
          total: { over: -110, under: -110, points: 52.5 }
        }
      }
    ],
    mlb: [
      {
        homeTeam: "New York Yankees",
        awayTeam: "Boston Red Sox",
        startTime: "April 10, 2025 19:05",
        odds: {
          moneyline: { home: -130, away: 110 },
          spread: { home: -115, away: -105, points: 1.5 },
          total: { over: -110, under: -110, points: 8.5 }
        }
      }
    ]
  };
  
  if (sport === "all") {
    return Object.values(sampleData).flat().filter(item => item);
  }
  
  return sampleData[sport] || [];
} 