import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Migration "migration";
import Time "mo:core/Time";

// Apply migration on upgrade using the with-clause
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
    authorSession : Text;
    createdAt : Int;
  };

  module CustomLevel {
    public func compareByCreatedAt(a : CustomLevel, b : CustomLevel) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  let customLevelsById = Map.empty<Nat, CustomLevel>();
  var nextLevelId = 0;

  // Username system using session IDs
  let sessionToUsername = Map.empty<Text, Text>();
  let usernameToSession = Map.empty<Text, Text>();
  let principalToSession = Map.empty<Principal, Text>();

  // Persistent owner principal
  var ownerPrincipal = "";

  // Username registration with session ID
  public shared ({ caller }) func registerUsername(sessionId : Text, name : Text) : async () {
    let trimmed = name.trimStart(#char(' ')).trimEnd(#char(' '));
    let len = trimmed.size();

    if (len < 3 or len > 20) {
      Runtime.trap("Username must be between 3 and 20 characters");
    };

    // Validate only letters, numbers, underscores
    func isValidChar(c : Char) : Bool {
      let code = c.toNat32();
      // 0-9: 48-57, A-Z: 65-90, a-z: 97-122, underscore: 95
      (code >= 48 and code <= 57) or (
        code >= 65 and code <= 90
      ) or (
        code >= 97 and code <= 122
      ) or code == 95;
    };

    let validUsername = trimmed.toArray().all(isValidChar);

    if (not validUsername) {
      Runtime.trap("Username can only contain letters, numbers, underscores");
    };

    switch (sessionToUsername.get(sessionId)) {
      case (?_) {
        Runtime.trap("Session already registered a username");
      };
      case (null) {};
    };

    switch (usernameToSession.get(trimmed)) {
      case (?_) {
        Runtime.trap("Username already taken");
      };
      case (null) {};
    };

    sessionToUsername.add(sessionId, trimmed);
    usernameToSession.add(trimmed, sessionId);
    principalToSession.add(caller, sessionId); // Add the principal→session mapping
  };

  public query ({ caller }) func getMyUsername(sessionId : Text) : async ?Text {
    sessionToUsername.get(sessionId);
  };

  public query ({ caller }) func getAllUsernames() : async [(Text, Text)] {
    sessionToUsername.entries().toArray();
  };

  public shared ({ caller }) func adminResetUsernames(secret : Text) : async () {
    if (secret != "tungmaster2024owner") {
      Runtime.trap("Unauthorized");
    };

    sessionToUsername.clear();
    usernameToSession.clear();
    principalToSession.clear();
  };

  public shared ({ caller }) func resetMyUsername(sessionId : Text) : async () {
    switch (sessionToUsername.get(sessionId)) {
      case (null) {
        Runtime.trap("No username found for this session");
      };
      case (?username) {
        sessionToUsername.remove(sessionId);
        usernameToSession.remove(username);

        // Remove associated principal entry
        let entries = principalToSession.entries().toArray();
        for ((principal, _sessionId) in entries.values()) {
          if (_sessionId == sessionId) {
            principalToSession.remove(principal);
          };
        };
      };
    };
  };

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
  public query ({ caller }) func getMyStats() : async ?UserStats {
    stats.get(caller);
  };

  // Get top 100 players for leaderboard
  public query func getLeaderboard() : async [(Principal, UserStats)] {
    let statsArray = stats.entries().toArray();
    let sortedStats = statsArray.sort(UserStats.compareByBestStageThenDeaths);
    let entriesToTake = if (sortedStats.size() < 100) { sortedStats.size() } else { 100 };
    sortedStats.sliceToArray(0, entriesToTake);
  };

  // Get top 100 players for speed runs (lowest non-zero completion time)
  public query func getSpeedLeaderboard() : async [(Principal, UserStats)] {
    let filteredStats = stats.entries().toArray().filter(
      func(entry) {
        entry.1.bestCompletionTimeMs > 0;
      }
    );
    let sortedStats = filteredStats.sort(UserStats.compareByCompletionTime);
    let entriesToTake = if (sortedStats.size() < 100) { sortedStats.size() } else { 100 };
    sortedStats.sliceToArray(0, entriesToTake);
  };

  // Get leaderboard with usernames appended
  public query ({ caller }) func getLeaderboardWithUsernames() : async [(Principal, UserStats, Text)] {
    let statsArray = stats.entries().toArray();
    let sortedStats = statsArray.sort(UserStats.compareByBestStageThenDeaths);
    let entriesToTake = if (sortedStats.size() < 100) { sortedStats.size() } else { 100 };
    let leaderboard = sortedStats.sliceToArray(0, entriesToTake);

    // Map to include username
    leaderboard.map<(Principal, UserStats), (Principal, UserStats, Text)>(
      func((principal, stats)) {
        let maybeSessionId = principalToSession.get(principal);
        switch (maybeSessionId) {
          case (null) { (principal, stats, "") };
          case (?sessionId) {
            let maybeUsername = sessionToUsername.get(sessionId);
            switch (maybeUsername) {
              case (null) { (principal, stats, "") };
              case (?username) { (principal, stats, username) };
            };
          };
        };
      }
    );
  };

  // Get speed leaderboard with usernames appended
  public query ({ caller }) func getSpeedLeaderboardWithUsernames() : async [(Principal, UserStats, Text)] {
    let filteredStats = stats.entries().toArray().filter(
      func(entry) {
        entry.1.bestCompletionTimeMs > 0;
      }
    );
    let sortedStats = filteredStats.sort(UserStats.compareByCompletionTime);
    let entriesToTake = if (sortedStats.size() < 100) { sortedStats.size() } else { 100 };
    let speedLeaderboard = sortedStats.sliceToArray(0, entriesToTake);

    // Map to include username
    speedLeaderboard.map<(Principal, UserStats), (Principal, UserStats, Text)>(
      func((principal, stats)) {
        let maybeSessionId = principalToSession.get(principal);
        switch (maybeSessionId) {
          case (null) { (principal, stats, "") };
          case (?sessionId) {
            let maybeUsername = sessionToUsername.get(sessionId);
            switch (maybeUsername) {
              case (null) { (principal, stats, "") };
              case (?username) { (principal, stats, username) };
            };
          };
        };
      }
    );
  };

  // Save new custom level
  public shared ({ caller }) func saveCustomLevel(sessionId : Text, name : Text, platformsJson : Text, worldWidth : Nat, bgHue : Nat) : async () {
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

    let existingLevelsCount = customLevelsById.values().toArray().filter(
      func(level) { level.authorSession == sessionId }
    ).size();

    if (existingLevelsCount >= 2) {
      Runtime.trap("You already have 2 published levels. Delete one before publishing again.");
    };

    let newLevel : CustomLevel = {
      id = nextLevelId;
      name = trimmedName;
      platformsJson;
      worldWidth;
      bgHue;
      author = caller;
      authorSession = sessionId;
      createdAt = Time.now();
    };

    customLevelsById.add(nextLevelId, newLevel);
    nextLevelId += 1;
  };

  public query ({ caller }) func getMyLevel(sessionId : Text) : async ?CustomLevel {
    var mostRecentLevel : ?CustomLevel = null;
    var latestTime : Int = 0;

    for ((_, level) in customLevelsById.entries()) {
      if (level.authorSession == sessionId and level.createdAt > latestTime) {
        mostRecentLevel := ?level;
        latestTime := level.createdAt;
      };
    };

    mostRecentLevel;
  };

  public query ({ caller }) func getMyLevels(sessionId : Text) : async [CustomLevel] {
    let allLevels = customLevelsById.values().toArray();
    let filteredLevels = allLevels.filter(
      func(level) { level.authorSession == sessionId }
    );
    filteredLevels.sort(CustomLevel.compareByCreatedAt);
  };

  public query func getPublicLevels() : async [CustomLevel] {
    let levelsArray = customLevelsById.values().toArray();
    let sortedLevels = levelsArray.sort(CustomLevel.compareByCreatedAt);
    let levelsToTake = if (sortedLevels.size() < 100) { sortedLevels.size() } else { 100 };
    sortedLevels.sliceToArray(0, levelsToTake);
  };

  public shared ({ caller }) func deleteMyLevel(sessionId : Text) : async () {
    var mostRecentLevelId : ?Nat = null;
    var latestTime : Int = 0;

    for ((id, level) in customLevelsById.entries()) {
      if (level.authorSession == sessionId and level.createdAt > latestTime) {
        mostRecentLevelId := ?id;
        latestTime := level.createdAt;
      };
    };

    switch (mostRecentLevelId) {
      case (null) {
        Runtime.trap("No custom level found for current user");
      };
      case (?id) {
        customLevelsById.remove(id);
      };
    };
  };

  public query ({ caller }) func getLevelById(id : Nat) : async ?CustomLevel {
    customLevelsById.get(id);
  };

  public shared ({ caller }) func deleteLevel(sessionId : Text, id : Nat) : async () {
    switch (customLevelsById.get(id)) {
      case (null) { Runtime.trap("Level with id " # id.toText() # " not found") };
      case (?level) {
        if (level.authorSession != sessionId) {
          Runtime.trap("Only the author can delete this level");
        };

        customLevelsById.remove(id);
      };
    };
  };

  // Function to claim owner principal
  public shared ({ caller }) func claimOwnerPrincipal(secret : Text) : async Bool {
    if (secret == "tungmaster2024owner" and ownerPrincipal == "") {
      ownerPrincipal := caller.toText();
      true;
    } else if (caller.toText() == ownerPrincipal and ownerPrincipal != "") {
      true; // Already claimed by this caller
    } else {
      false;
    };
  };
};
