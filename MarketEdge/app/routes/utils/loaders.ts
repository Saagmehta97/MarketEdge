import { createCookie, json, LoaderFunctionArgs } from "@remix-run/node";
import { parse } from "postcss";

export interface MarketData {
    type: string;
    data: OddsData[];
  }

export interface OddsData {
    name: string;
    my_book: string;
    pinnacle: string;
    my_point?: string;
    p_point?: string;
    book_name: string;
    pct_edge: number;
    has_edge: boolean;
  }

export type LoaderData = {
    games: GameType[];
    sport: string;
    availableSports: string[];
  };

export type GameType = {
    id: string;
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    formatted_markets: MarketData[];
    isFollowed?: boolean;
  };

export const API_CONFIG = {
    // Use environment variables or fallback to localhost
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
    endpoints: {
      sports: "/sports",
      events: "/events",
      follow: "/follow"
    }
  };

export function parseCookie(cookieHeader: string | null) {
    if (!cookieHeader) {
        return null;
    }
    const cookie = cookieHeader.split("=");
    const token = cookie[1];
    return token;
}

export function createdSharedLoader(followed: boolean) {
    return async function loader ({ request, params, context }: LoaderFunctionArgs) {
        const cookieHeader = request.headers.get("Cookie");
        const token = parseCookie(cookieHeader);
        const url = new URL(request.url);
        const sport = url.searchParams.get("sport")?.toLowerCase() || "all";
        
        try {
            // Fetch available sports from our backend
            console.log("Fetching sports from:", `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sports}`);
            const sportsResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sports}`);
            
            // Log response headers for quota information
            console.log("Sports API Response Headers:", Object.fromEntries(sportsResponse.headers.entries()));
            
            if (!sportsResponse.ok) {
                console.error("Sports API Error:", {
                    status: sportsResponse.status,
                    statusText: sportsResponse.statusText,
                    headers: Object.fromEntries(sportsResponse.headers.entries())
                });
                throw new Error(`Failed to fetch sports: ${sportsResponse.status}`);
            }
            
            const availableSports = await sportsResponse.json();
            
            // Fetch events for the selected sport
            const eventsUrl = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.events}`);
            eventsUrl.searchParams.append("sport", sport);
            eventsUrl.searchParams.append("followed", followed.toString())
            
            console.log("Fetching events from:", eventsUrl.toString());
            const eventsResponse = await fetch(eventsUrl.toString(), {
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                    "Content-Type": "application/json"
                }
            });
            
            // Log response headers for quota information
            console.log("Events API Response Headers:", Object.fromEntries(eventsResponse.headers.entries()));
            
            if (!eventsResponse.ok) {
                // If we get a 401, return empty data and let the client handle the redirect
                if (eventsResponse.status === 401) {
                    console.log("Token expired or invalid");
                    return json<LoaderData>({ games: [], sport, availableSports });
                }
                
                console.error("Events API Error:", {
                    status: eventsResponse.status,
                    statusText: eventsResponse.statusText,
                    headers: Object.fromEntries(eventsResponse.headers.entries())
                });
                throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
            }
            
            // Get the data from the backend
            const backendGames = await eventsResponse.json();
            console.log("Number of games fetched:", backendGames.length);
            
            // Transform the data to match what our frontend expects
            const games = backendGames.map((game: any) => {
            // Create formatted_markets array from the odds object
            const formatted_markets: MarketData[] = [];
            
            if (game.odds) {
                // Add moneyline
                if (game.odds.moneyline) {
                formatted_markets.push({
                    type: 'h2h',
                    data: [
                    {
                        name: game.homeTeam,
                        my_book: String(game.odds.moneyline.home),
                        pinnacle: String(game.odds.moneyline.home - 10), // Simulating Pinnacle odds
                        book_name: 'DraftKings',
                        pct_edge: 1.2, // Sample edge
                        has_edge: game.odds.moneyline.home < -200, // Sample logic for edge
                    },
                    {
                        name: game.awayTeam,
                        my_book: String(game.odds.moneyline.away),
                        pinnacle: String(game.odds.moneyline.away - 5), // Simulating Pinnacle odds
                        book_name: 'FanDuel',
                        pct_edge: 0.8, // Sample edge
                        has_edge: game.odds.moneyline.away > 200, // Sample logic for edge
                    }
                    ]
                });
                }
                
                // Add spread
                if (game.odds.spread) {
                formatted_markets.push({
                    type: 'spreads',
                    data: [
                    {
                        name: game.homeTeam,
                        my_book: String(game.odds.spread.home),
                        pinnacle: String(game.odds.spread.home - 2), // Simulating Pinnacle odds
                        my_point: String(game.odds.spread.points),
                        p_point: String(game.odds.spread.points),
                        book_name: 'BetMGM',
                        pct_edge: -1.16,
                        has_edge: false,
                    },
                    {
                        name: game.awayTeam,
                        my_book: String(game.odds.spread.away),
                        pinnacle: String(game.odds.spread.away - 3), // Simulating Pinnacle odds
                        my_point: String(-1 * game.odds.spread.points),
                        p_point: String(-1 * game.odds.spread.points),
                        book_name: 'Pinnacle',
                        pct_edge: -1.16,
                        has_edge: false,
                    }
                    ]
                });
                }
                
                // Add totals
                if (game.odds.total) {
                formatted_markets.push({
                    type: 'totals',
                    data: [
                    {
                        name: 'Over',
                        my_book: String(game.odds.total.over),
                        pinnacle: String(game.odds.total.over - 4), // Simulating Pinnacle odds
                        my_point: String(game.odds.total.points),
                        p_point: String(game.odds.total.points),
                        book_name: 'BetMGM',
                        pct_edge: 3.88,
                        has_edge: true,
                    },
                    {
                        name: 'Under',
                        my_book: String(game.odds.total.under),
                        pinnacle: String(game.odds.total.under - 2), // Simulating Pinnacle odds
                        my_point: String(game.odds.total.points),
                        p_point: String(game.odds.total.points),
                        book_name: 'Pinnacle',
                        pct_edge: -1.4,
                        has_edge: false,
                    }
                    ]
                });
                }
            }
            
            return {
                id: game.id,
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                startTime: game.startTime,
                formatted_markets,
                isFollowed: game.isFollowed
            };
            });
            
            // if (games.length > 0) {
            // console.log("Transformed game data:", JSON.stringify(games[0], null, 2));
            // }
            
            return json<LoaderData>({ games, sport, availableSports });
        } catch (error) {
            console.error("Error fetching data:", error);
            // Return empty arrays if there's an error
            return json<LoaderData>({ games: [], sport, availableSports: [] });
        };
    }
}