import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserStats = {
    bestStage : Nat;
    totalDeaths : Nat;
    totalWins : Nat;
    bestCompletionTimeMs : Nat;
  };

  module UserStats {
    public func compareByBestStageThenDeaths(a : (Principal, UserStats), b : (Principal, UserStats)) : Order.Order {
      switch (Nat.compare(b.1.bestStage, a.1.bestStage)) {
        case (#equal) { Nat.compare(a.1.totalDeaths, b.1.totalDeaths) };
        case (order) { order };
      };
    };

    public func compareByCompletionTime(a : (Principal, UserStats), b : (Principal, UserStats)) : Order.Order {
      Nat.compare(a.1.bestCompletionTimeMs, b.1.bestCompletionTimeMs);
    };
  };

  let stats = Map.empty<Principal, UserStats>();

  type CustomLevel = {
    id : Nat;
    name : Text;
    platformsJson : Text;
    worldWidth : Nat;
    bgHue : Nat;
    author : Principal;
    createdAt : Int;
  };

  module CustomLevel {
    public func compareByCreatedAt(a : CustomLevel, b : CustomLevel) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  var nextLevelId = 1;
  let customLevels = Map.empty<Principal, CustomLevel>();

  // Save or update a player's game stats
  public shared ({ caller }) func saveGameResult(stageReached : Nat, deathsThisRun : Nat, completionTimeMs : Nat) : async () {
    if (stageReached < 1 or stageReached > 10) {
      Runtime.trap("Invalid stage reached. Must be between 1 and 10");
    };

    let updatedStats = switch (stats.get(caller)) {
      case (null) {
        {
          bestStage = stageReached;
          totalDeaths = deathsThisRun;
          totalWins = if (stageReached == 10) { 1 } else { 0 };
          bestCompletionTimeMs = if (stageReached == 10 and completionTimeMs > 0) { completionTimeMs } else { 0 };
        };
      };
      case (?existing) {
        let improvedBest = if (stageReached > existing.bestStage) { stageReached } else { existing.bestStage };
        let hasCompleted = if (stageReached == 10) { existing.totalWins + 1 } else {
          existing.totalWins;
        };

        let newBestTime = if (stageReached == 10 and completionTimeMs > 0) {
          if (existing.bestCompletionTimeMs == 0 or completionTimeMs < existing.bestCompletionTimeMs) {
            completionTimeMs;
          } else {
            existing.bestCompletionTimeMs;
          };
        } else {
          existing.bestCompletionTimeMs;
        };

        {
          bestStage = improvedBest;
          totalDeaths = existing.totalDeaths + deathsThisRun;
          totalWins = hasCompleted;
          bestCompletionTimeMs = newBestTime;
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

  // Get top 10 players for speed runs (lowest non-zero completion time)
  public query func getSpeedLeaderboard() : async [(Principal, UserStats)] {
    let filteredStats = stats.entries().toArray().filter(
      func(entry) {
        entry.1.bestCompletionTimeMs > 0;
      }
    );
    let sortedStats = filteredStats.sort(UserStats.compareByCompletionTime);
    let entriesToTake = if (sortedStats.size() < 10) { sortedStats.size() } else { 10 };
    sortedStats.sliceToArray(0, entriesToTake);
  };

  // Save or update custom level for a user
  public shared ({ caller }) func saveCustomLevel(name : Text, platformsJson : Text, worldWidth : Nat, bgHue : Nat) : async () {
    let trimmedName = name.trimStart(#char(' ')).trimEnd(#char(' '));
    let nameLen = trimmedName.size();

    if (nameLen < 1 or nameLen > 40) {
      Runtime.trap("Level name must be between 1-40 characters");
    };
    if (worldWidth < 1000 or worldWidth > 20000) {
      Runtime.trap("World width must be between 1,000 and 20,000");
    };
    if (bgHue > 360) {
      Runtime.trap("Background hue must be between 0 and 360");
    };
    if (platformsJson.size() > 50000) {
      Runtime.trap("Platforms JSON too large (max 50,000 characters)");
    };

    let newLevel : CustomLevel = {
      id = nextLevelId;
      name = trimmedName;
      platformsJson;
      worldWidth;
      bgHue;
      author = caller;
      createdAt = Time.now();
    };

    customLevels.add(caller, newLevel);
    nextLevelId += 1;
  };

  // Get current user's custom level
  public query ({ caller }) func getMyLevel() : async ?CustomLevel {
    customLevels.get(caller);
  };

  // Get up to 100 newest public custom levels
  public query func getPublicLevels() : async [CustomLevel] {
    let levelsArray = customLevels.values().toArray();
    let sortedLevels = levelsArray.sort(CustomLevel.compareByCreatedAt);
    let levelsToTake = if (sortedLevels.size() < 100) { sortedLevels.size() } else { 100 };
    sortedLevels.sliceToArray(0, levelsToTake);
  };

  // Delete current user's custom level
  public shared ({ caller }) func deleteMyLevel() : async () {
    if (not customLevels.containsKey(caller)) {
      Runtime.trap("No custom level found for current user");
    };
    customLevels.remove(caller);
  };
};
