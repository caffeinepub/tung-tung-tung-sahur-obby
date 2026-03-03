import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserStats {
    totalDeaths: bigint;
    totalWins: bigint;
    bestStage: bigint;
}
export interface backendInterface {
    getLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    getMyStats(): Promise<UserStats>;
    saveGameResult(stageReached: bigint, deathsThisRun: bigint): Promise<void>;
}
