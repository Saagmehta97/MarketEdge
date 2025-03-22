import { redirect } from "@remix-run/node";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import GameCard from "~/components/GameCard";
import SportsList from "~/components/SportsList"

export const meta: MetaFunction = () => {
  return [
    { title: "MarketEdge - Sports Betting Odds" },
    { name: "description", content: "Find the best sports betting odds and arbitrage opportunities" },
  ];
};

export const loader: LoaderFunction = async () => {
  return redirect("/sports");
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
  // This component won't be rendered because we're redirecting
  return null;
}


