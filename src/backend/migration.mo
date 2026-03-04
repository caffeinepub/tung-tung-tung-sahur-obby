import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type UserStats = {
    bestStage : Nat;
    totalDeaths : Nat;
    totalWins : Nat;
    bestCompletionTimeMs : Nat;
  };

  type OldCustomLevel = {
    id : Nat;
    name : Text;
    platformsJson : Text;
    worldWidth : Nat;
    bgHue : Nat;
    author : Principal;
    createdAt : Int;
  };

  type OldActor = {
    stats : Map.Map<Principal, UserStats>;
    usernames : Map.Map<Text, Principal>;
    principalToUsername : Map.Map<Principal, Text>;
    customLevels : Map.Map<Principal, OldCustomLevel>;
    nextLevelId : Nat;
  };

  type NewCustomLevel = {
    id : Nat;
    name : Text;
    platformsJson : Text;
    worldWidth : Nat;
    bgHue : Nat;
    author : Principal;
    createdAt : Int;
  };

  type NewActor = {
    stats : Map.Map<Principal, UserStats>;
    usernames : Map.Map<Text, Principal>;
    principalToUsername : Map.Map<Principal, Text>;
    customLevelsById : Map.Map<Nat, NewCustomLevel>;
    nextLevelId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let customLevelsById = Map.empty<Nat, NewCustomLevel>();
    var nextLevelId = old.nextLevelId;

    for ((principal, level) in old.customLevels.entries()) {
      let newLevel : NewCustomLevel = {
        id = nextLevelId;
        name = level.name;
        platformsJson = level.platformsJson;
        worldWidth = level.worldWidth;
        bgHue = level.bgHue;
        author = level.author;
        createdAt = level.createdAt;
      };

      customLevelsById.add(nextLevelId, newLevel);
      nextLevelId += 1;
    };

    {
      stats = old.stats;
      usernames = old.usernames;
      principalToUsername = old.principalToUsername;
      customLevelsById;
      nextLevelId;
    };
  };
};
