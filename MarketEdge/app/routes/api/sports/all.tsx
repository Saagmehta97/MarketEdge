import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  // In a real app, you would fetch from all sports APIs and combine the results
  // For development, we'll return sample data
  const sampleData = [
    // NBA games
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
    },
    // NFL games
    {
      homeTeam: "Kansas City Chiefs",
      awayTeam: "Buffalo Bills",
      startTime: "September 15, 2025 19:30",
      odds: {
        moneyline: { home: -150, away: 130 },
        spread: { home: -110, away: -110, points: 3.5 },
        total: { over: -110, under: -110, points: 52.5 }
      }
    },
    // MLB games
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
  ];
  
  return json(sampleData);
}; 