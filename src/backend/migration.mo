import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  /// Old types
  type OldUserStats = {
    bestStage : Nat;
    totalDeaths : Nat;
    totalWins : Nat;
  };

  type OldActor = {
    stats : Map.Map<Principal, OldUserStats>;
    nextLevelId : Nat;
  };

  /// New types
  type NewUserStats = {
    bestStage : Nat;
    totalDeaths : Nat;
    totalWins : Nat;
    bestCompletionTimeMs : Nat;
  };

  type NewActor = {
    stats : Map.Map<Principal, NewUserStats>;
    nextLevelId : Nat;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newStats = old.stats.map<Principal, OldUserStats, NewUserStats>(
      func(_principal, oldStats) {
        { oldStats with bestCompletionTimeMs = 0 };
      }
    );
    {
      old with stats = newStats;
    };
  };
};
