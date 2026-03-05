import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
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
    customLevelsById : Map.Map<Nat, OldCustomLevel>;
  };

  type NewCustomLevel = {
    id : Nat;
    name : Text;
    platformsJson : Text;
    worldWidth : Nat;
    bgHue : Nat;
    author : Principal;
    authorSession : Text;
    createdAt : Int;
  };

  type NewActor = {
    customLevelsById : Map.Map<Nat, NewCustomLevel>;
  };

  public func run(old : OldActor) : NewActor {
    let customLevelsById = old.customLevelsById.map<Nat, OldCustomLevel, NewCustomLevel>(
      func(_id, oldLevel) {
        { oldLevel with authorSession = "" };
      }
    );
    { customLevelsById };
  };
};
