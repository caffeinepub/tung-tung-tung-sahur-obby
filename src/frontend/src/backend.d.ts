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
    bestCompletionTimeMs: bigint;
    totalDeaths: bigint;
    totalWins: bigint;
    bestStage: bigint;
}
export interface CustomLevel {
    id: bigint;
    worldWidth: bigint;
    name: string;
    createdAt: bigint;
    author: Principal;
    platformsJson: string;
    bgHue: bigint;
}
export interface backendInterface {
    deleteMyLevel(): Promise<void>;
    getLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    getMyLevel(): Promise<CustomLevel | null>;
    getMyStats(): Promise<UserStats>;
    getPublicLevels(): Promise<Array<CustomLevel>>;
    getSpeedLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    saveCustomLevel(name: string, platformsJson: string, worldWidth: bigint, bgHue: bigint): Promise<void>;
    saveGameResult(stageReached: bigint, deathsThisRun: bigint, completionTimeMs: bigint): Promise<void>;
}
