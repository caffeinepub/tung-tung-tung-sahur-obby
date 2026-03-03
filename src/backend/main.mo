import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type UserStats = {
    bestStage : Nat;
    totalDeaths : Nat;
    totalWins : Nat;
  };

  module UserStats {
    public func compareByBestStageThenDeaths(a : (Principal, UserStats), b : (Principal, UserStats)) : Order.Order {
      switch (Nat.compare(b.1.bestStage, a.1.bestStage)) {
        case (#equal) { Nat.compare(a.1.totalDeaths, b.1.totalDeaths) };
        case (order) { order };
      };
    };
  };

  let stats = Map.empty<Principal, UserStats>();

  // Save or update a player's game stats
  public shared ({ caller }) func saveGameResult(stageReached : Nat, deathsThisRun : Nat) : async () {
    if (stageReached < 1 or stageReached > 10) {
      Runtime.trap("Invalid stage reached. Must be between 1 and 10");
    };

    let updatedStats = switch (stats.get(caller)) {
      case (null) {
        {
          bestStage = stageReached;
          totalDeaths = deathsThisRun;
          totalWins = if (stageReached == 10) { 1 } else { 0 };
        };
      };
      case (?existing) {
        let improvedBest = if (stageReached > existing.bestStage) { stageReached } else {
          existing.bestStage;
        };
        {
          bestStage = improvedBest;
          totalDeaths = existing.totalDeaths + deathsThisRun;
          totalWins = if (stageReached == 10) { existing.totalWins + 1 } else { existing.totalWins };
        };
      };
    };

    stats.add(caller, updatedStats);
  };

  // Get current user's stats
  public query ({ caller }) func getMyStats() : async UserStats {
    switch (stats.get(caller)) {
      case (null) {
        Runtime.trap("No stats found for current user");
      };
      case (?userStats) { userStats };
    };
  };

  // Get top 10 players for leaderboard
  public query func getLeaderboard() : async [(Principal, UserStats)] {
    let statsArray = stats.entries().toArray();
    let sortedStats = statsArray.sort(UserStats.compareByBestStageThenDeaths);
    let entriesToTake = if (sortedStats.size() < 10) { sortedStats.size() } else { 10 };
    sortedStats.sliceToArray(0, entriesToTake);
  };
};
