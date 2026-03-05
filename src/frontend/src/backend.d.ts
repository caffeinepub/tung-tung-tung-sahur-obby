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
    authorSession: string;
    author: Principal;
    platformsJson: string;
    bgHue: bigint;
}
export interface backendInterface {
    adminResetUsernames(secret: string): Promise<void>;
    claimOwnerPrincipal(secret: string): Promise<boolean>;
    deleteLevel(sessionId: string, id: bigint): Promise<void>;
    deleteMyLevel(sessionId: string): Promise<void>;
    getAllUsernames(): Promise<Array<[string, string]>>;
    getLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    getLeaderboardWithUsernames(): Promise<Array<[Principal, UserStats, string]>>;
    getLevelById(id: bigint): Promise<CustomLevel | null>;
    getMyLevel(sessionId: string): Promise<CustomLevel | null>;
    getMyLevels(sessionId: string): Promise<Array<CustomLevel>>;
    getMyStats(): Promise<UserStats | null>;
    getMyUsername(sessionId: string): Promise<string | null>;
    getPublicLevels(): Promise<Array<CustomLevel>>;
    getSpeedLeaderboard(): Promise<Array<[Principal, UserStats]>>;
    getSpeedLeaderboardWithUsernames(): Promise<Array<[Principal, UserStats, string]>>;
    registerUsername(sessionId: string, name: string): Promise<void>;
    resetMyUsername(sessionId: string): Promise<void>;
    saveCustomLevel(sessionId: string, name: string, platformsJson: string, worldWidth: bigint, bgHue: bigint): Promise<void>;
    saveGameResult(stageReached: bigint, deathsThisRun: bigint, completionTimeMs: bigint): Promise<void>;
}
