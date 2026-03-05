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
    deleteLevel(id: bigint): Promise<void>;
    deleteMyLevel(): Promise<void>;
    getAllUsernames(): Promise<Array<[Principal, string]>>;
    getLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    getLevelById(id: bigint): Promise<CustomLevel | null>;
    getMyLevel(): Promise<CustomLevel | null>;
    getMyLevels(): Promise<Array<CustomLevel>>;
    getMyStats(): Promise<UserStats>;
    getMyUsername(): Promise<string | null>;
    getPublicLevels(): Promise<Array<CustomLevel>>;
    getSpeedLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    getUsernameForPrincipal(p: Principal): Promise<string | null>;
    registerUsername(name: string): Promise<void>;
    saveCustomLevel(name: string, platformsJson: string, worldWidth: bigint, bgHue: bigint): Promise<void>;
    saveGameResult(stageReached: bigint, deathsThisRun: bigint, completionTimeMs: bigint): Promise<void>;
}
