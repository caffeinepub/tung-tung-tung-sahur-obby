import { useCallback, useEffect, useRef, useState } from "react";
import CommunityLevels from "./components/CommunityLevels";
import LeaderboardScreen from "./components/Leaderboard";
import type { SpeedLeaderboardEntry } from "./components/Leaderboard";
import { formatTime } from "./components/Leaderboard";
import LevelEditor from "./components/LevelEditor";
import ObbyCoreGame from "./components/ObbyCoreGame";
import type { Platform, StageConfig } from "./components/ObbyCoreGame";
import { useActor } from "./hooks/useActor";

// ===================================================
// TYPES
// ===================================================

type GameScreen =
  | "start"
  | "playing"
  | "gameover"
  | "win"
  | "editor"
  | "community"
  | "playing_custom"
  | "leaderboard";

interface LeaderboardEntry {
  principal: string;
  totalDeaths: bigint;
  totalWins: bigint;
  bestStage: bigint;
}

// ===================================================
// HELPER FUNCTION
// ===================================================

function buildCustomStageFromLevel(level: {
  name: string;
  platformsJson: string;
  worldWidth: number;
  bgHue: number;
}): StageConfig {
  return {
    id: 99,
    name: level.name,
    bgHue: level.bgHue,
    worldWidth: level.worldWidth,
    spinners: [],
    platforms: JSON.parse(level.platformsJson) as Platform[],
  };
}

// ===================================================
// LEADERBOARD SECTION
// ===================================================

function LeaderboardSection({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null;

  const rankClasses = ["lb-rank-1", "lb-rank-2", "lb-rank-3"];
  const rankEmoji = ["👑", "🥈", "🥉"];

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-title">Top Survivors</div>
      {entries.map((entry, i) => (
        <div key={entry.principal} className="leaderboard-row">
          <span className={`lb-rank ${rankClasses[i] ?? ""}`}>
            {rankEmoji[i] ?? `#${i + 1}`}
          </span>
          <span className="lb-principal" title={entry.principal}>
            {entry.principal.slice(0, 8)}...{entry.principal.slice(-4)}
          </span>
          <span className="lb-stat">
            <span>
              Stage{" "}
              <span className="lb-stat-val">{entry.bestStage.toString()}</span>
            </span>
            <span>
              Wins{" "}
              <span className="lb-stat-val">{entry.totalWins.toString()}</span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ===================================================
// HEART ICON
// ===================================================

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <span
      style={{
        color: filled ? "#f87171" : "rgba(248,113,113,0.25)",
        textShadow: filled ? "0 0 8px #f87171" : "none",
        transition: "all 0.3s ease",
      }}
    >
      ❤
    </span>
  );
}

// ===================================================
// DRUM PULSE HUD ELEMENT
// ===================================================

function DrumPulse({ active }: { active: boolean }) {
  return (
    <div className="drum-pulse-container" data-ocid="hud.drum_pulse">
      <span className="drum-pulse-label">TUNG</span>
      <div className={`drum-ring ${active ? "pulse-active" : ""}`} />
      <span className="drum-pulse-label">TUNG</span>
      <div
        className={`drum-ring ${active ? "pulse-active" : ""}`}
        style={{ animationDelay: "0.15s" }}
      />
      <span className="drum-pulse-label">TUNG</span>
      <div
        className={`drum-ring ${active ? "pulse-active" : ""}`}
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}

// ===================================================
// START SCREEN
// ===================================================

interface StartScreenProps {
  onStart: () => void;
  onEditor: () => void;
  onCommunity: () => void;
  onLeaderboard: () => void;
  leaderboard: LeaderboardEntry[];
  personalBest: bigint | null;
  isLoading: boolean;
}

function StartScreen({
  onStart,
  onEditor,
  onCommunity,
  onLeaderboard,
  leaderboard: _leaderboard,
  personalBest,
  isLoading,
}: StartScreenProps) {
  return (
    <div className="screen-overlay">
      <div className="screen-overlay-bg" />
      <div className="screen-content">
        {/* Creature silhouette decoration */}
        <svg
          className="creature-silhouette"
          viewBox="0 0 60 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Tung Tung Tung Sahur creature silhouette"
          role="img"
        >
          <ellipse
            cx="30"
            cy="12"
            rx="9"
            ry="12"
            fill="#2d0a5e"
            stroke="#7c3aed"
            strokeWidth="2"
          />
          <line
            x1="30"
            y1="24"
            x2="30"
            y2="56"
            stroke="#2d0a5e"
            strokeWidth="3"
          />
          <line
            x1="30"
            y1="28"
            x2="10"
            y2="44"
            stroke="#2d0a5e"
            strokeWidth="3"
          />
          <line
            x1="30"
            y1="28"
            x2="50"
            y2="44"
            stroke="#2d0a5e"
            strokeWidth="3"
          />
          <line
            x1="30"
            y1="56"
            x2="18"
            y2="78"
            stroke="#2d0a5e"
            strokeWidth="3"
          />
          <line
            x1="30"
            y1="56"
            x2="42"
            y2="78"
            stroke="#2d0a5e"
            strokeWidth="3"
          />
          <circle cx="30" cy="40" r="10" stroke="#7c3aed" strokeWidth="2" />
        </svg>

        <h1 className="game-title">
          TUNG TUNG TUNG
          <br />
          SAHUR OBBY
        </h1>
        <p className="game-subtitle">
          Can you escape the creature? 10 stages of terror await.
        </p>

        {personalBest !== null && (
          <div className="personal-best">
            <span className="personal-best-label">Personal Best</span>
            <span style={{ fontWeight: 800 }}>
              Stage {personalBest.toString()} / 10
            </span>
          </div>
        )}

        <div className="controls-card">
          <div className="controls-title">Controls</div>
          <div className="controls-row">
            <span className="key-hint">
              <span className="key-badge">W / ↑</span> Move left
            </span>
            <span className="key-hint">
              <span className="key-badge">A / ←</span> Move left
            </span>
            <span className="key-hint">
              <span className="key-badge">D / →</span> Move right
            </span>
            <span className="key-hint">
              <span className="key-badge">SPACE</span> Jump (×2)
            </span>
          </div>
        </div>

        <button
          type="button"
          className="game-button game-button-primary"
          onClick={onStart}
          disabled={isLoading}
          data-ocid="start.primary_button"
        >
          {isLoading ? "Loading..." : "▶ START GAME"}
        </button>

        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button
            type="button"
            className="game-button game-button-secondary"
            onClick={onEditor}
            data-ocid="start.editor_button"
            style={{ flex: 1, fontSize: 14, padding: "12px 16px" }}
          >
            ⚙ LEVEL EDITOR
          </button>
          <button
            type="button"
            className="game-button game-button-secondary"
            onClick={onCommunity}
            data-ocid="start.community_button"
            style={{ flex: 1, fontSize: 14, padding: "12px 16px" }}
          >
            🌐 COMMUNITY
          </button>
        </div>

        <button
          type="button"
          className="lb-nav-btn"
          onClick={onLeaderboard}
          data-ocid="start.leaderboard_button"
        >
          🏆 LEADERBOARD
        </button>
      </div>
    </div>
  );
}

// ===================================================
// WIN SCREEN
// ===================================================

interface WinScreenProps {
  deaths: number;
  onReplay: () => void;
  leaderboard: LeaderboardEntry[];
  isCustomLevel?: boolean;
  completionTimeMs?: number;
}

function WinScreen({
  deaths,
  onReplay,
  leaderboard,
  isCustomLevel,
  completionTimeMs,
}: WinScreenProps) {
  return (
    <div className="screen-overlay">
      <div className="screen-overlay-bg" />
      <div className="screen-content">
        <div className="win-title">
          {isCustomLevel ? (
            <>
              LEVEL COMPLETE!
              <br />
              YOU MADE IT!
            </>
          ) : (
            <>
              YOU ESCAPED
              <br />
              TUNG TUNG TUNG SAHUR!
            </>
          )}
        </div>
        <p className="game-subtitle">
          {isCustomLevel
            ? "You completed the custom level!"
            : "The creature's drum beats fade into the distance..."}
        </p>

        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-label">Deaths</span>
            <span className="stat-value">{deaths}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Stage</span>
            <span className="stat-value">
              {isCustomLevel ? "Custom ✓" : "10/10 ✓"}
            </span>
          </div>
          {completionTimeMs !== undefined && completionTimeMs > 0 && (
            <div className="stat-pill">
              <span className="stat-label">Time</span>
              <span
                className="stat-value"
                style={{ color: "var(--neon-cyan)" }}
              >
                {formatTime(completionTimeMs)}
              </span>
            </div>
          )}
        </div>

        {!isCustomLevel && <LeaderboardSection entries={leaderboard} />}

        <button
          type="button"
          className="game-button game-button-primary"
          onClick={onReplay}
          data-ocid="win.primary_button"
        >
          {isCustomLevel ? "← Back to Menu" : "↺ PLAY AGAIN"}
        </button>
      </div>
    </div>
  );
}

// ===================================================
// GAME OVER SCREEN
// ===================================================

interface GameOverScreenProps {
  deaths: number;
  stage: number;
  onRetry: () => void;
  isCustomLevel?: boolean;
}

function GameOverScreen({
  deaths,
  stage,
  onRetry,
  isCustomLevel,
}: GameOverScreenProps) {
  return (
    <div className="screen-overlay">
      <div className="screen-overlay-bg" />
      <div className="screen-content">
        <div className="gameover-title">THE CREATURE GOT YOU...</div>
        <p className="game-subtitle" style={{ color: "rgba(248,113,113,0.7)" }}>
          Tung... tung... tung...
        </p>

        <div className="stats-row">
          <div className="stat-pill">
            <span className="stat-label">Deaths</span>
            <span className="stat-value">{deaths}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Reached Stage</span>
            <span className="stat-value">
              {isCustomLevel ? "Custom" : `${stage}/10`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="game-button game-button-secondary"
          onClick={onRetry}
          data-ocid="gameover.primary_button"
        >
          {isCustomLevel ? "← Back to Menu" : "↺ TRY AGAIN"}
        </button>
      </div>
    </div>
  );
}

// ===================================================
// HUD OVERLAY
// ===================================================

interface HUDProps {
  stage: number;
  lives: number;
  deaths: number;
  drumActive: boolean;
  isCustomLevel?: boolean;
  onMenu: () => void;
}

function HUD({
  stage,
  lives,
  deaths,
  drumActive,
  isCustomLevel,
  onMenu,
}: HUDProps) {
  return (
    <div className="game-hud">
      <div className="hud-top">
        <button
          type="button"
          className="hud-menu-btn"
          onClick={onMenu}
          data-ocid="hud.menu_button"
          title="Back to Menu"
        >
          ← Menu
        </button>
        <div className="hud-panel hud-stage" data-ocid="hud.stage_panel">
          {isCustomLevel ? "Custom Level" : `Stage ${stage} / 10`}
        </div>
        <div className="hud-panel hud-lives" data-ocid="hud.lives_panel">
          <HeartIcon filled={lives >= 1} />
          <HeartIcon filled={lives >= 2} />
          <HeartIcon filled={lives >= 3} />
        </div>
        <div className="hud-panel hud-deaths" data-ocid="hud.deaths_panel">
          💀 {deaths}
        </div>
      </div>
      <div className="hud-bottom">
        <DrumPulse active={drumActive} />
      </div>
    </div>
  );
}

// ===================================================
// TOUCH CONTROLS
// ===================================================

function TouchControls({ onJump }: { onJump: () => void }) {
  return (
    <div className="touch-controls">
      <div className="touch-left-zone">
        <span
          style={{
            color: "rgba(168,85,247,0.3)",
            fontSize: 12,
            fontFamily: "Sora",
          }}
        >
          ← drag →
        </span>
      </div>
      <div className="touch-right-zone">
        <button
          type="button"
          className="touch-jump-btn"
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          data-ocid="touch.jump_button"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

// ===================================================
// MAIN APP
// ===================================================

export default function App() {
  const { actor } = useActor();
  const [screen, setScreen] = useState<GameScreen>("start");
  const [stage, setStage] = useState(1);
  const [lives, setLives] = useState(3);
  const [deaths, setDeaths] = useState(0);
  const [drumActive, setDrumActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [speedLeaderboard, setSpeedLeaderboard] = useState<
    SpeedLeaderboardEntry[]
  >([]);
  const [personalBest, setPersonalBest] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [finalDeaths, setFinalDeaths] = useState(0);
  const [finalStage, setFinalStage] = useState(1);
  const [finalCompletionTimeMs, setFinalCompletionTimeMs] = useState(0);

  // Timer for speed runs
  const startTimeRef = useRef<number | null>(null);

  // Custom level state
  const [customStageToPlay, setCustomStageToPlay] =
    useState<StageConfig | null>(null);
  const [userExistingLevel, setUserExistingLevel] = useState<{
    name: string;
    platformsJson: string;
    worldWidth: number;
    bgHue: number;
  } | null>(null);

  const gameActiveRef = useRef(false);

  // Load leaderboard + user's saved level
  const loadLeaderboard = useCallback(async () => {
    if (!actor) return;
    setIsLeaderboardLoading(true);
    try {
      const [lb, speedLb, stats] = await Promise.all([
        actor.getLeaderboard(),
        actor.getSpeedLeaderboard(),
        actor.getMyStats(),
      ]);

      const entries: LeaderboardEntry[] = lb
        .map(([principal, userStats]) => ({
          principal: principal.toString(),
          totalDeaths: userStats.totalDeaths,
          totalWins: userStats.totalWins,
          bestStage: userStats.bestStage,
        }))
        .sort((a, b) => {
          if (a.bestStage > b.bestStage) return -1;
          if (a.bestStage < b.bestStage) return 1;
          return Number(a.totalDeaths) - Number(b.totalDeaths);
        })
        .slice(0, 10);

      const speedEntries: SpeedLeaderboardEntry[] = speedLb
        .filter(([, userStats]) => userStats.bestCompletionTimeMs > 0n)
        .map(([principal, userStats]) => ({
          principal: principal.toString(),
          bestCompletionTimeMs: userStats.bestCompletionTimeMs,
          totalWins: userStats.totalWins,
        }))
        .sort(
          (a, b) =>
            Number(a.bestCompletionTimeMs) - Number(b.bestCompletionTimeMs),
        )
        .slice(0, 10);

      setLeaderboard(entries);
      setSpeedLeaderboard(speedEntries);

      if (stats.bestStage > 0n) {
        setPersonalBest(stats.bestStage);
      }
    } catch {
      // Silently fail if backend unavailable
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, [actor]);

  // Load user's existing custom level
  const loadUserLevel = useCallback(async () => {
    if (!actor) return;
    try {
      const myLevel = await actor.getMyLevel();
      if (myLevel) {
        setUserExistingLevel({
          name: myLevel.name,
          platformsJson: myLevel.platformsJson,
          worldWidth: Number(myLevel.worldWidth),
          bgHue: Number(myLevel.bgHue),
        });
      }
    } catch {
      // Silently fail
    }
  }, [actor]);

  useEffect(() => {
    if (actor) {
      loadLeaderboard();
      loadUserLevel();
    }
  }, [actor, loadLeaderboard, loadUserLevel]);

  const handleStart = useCallback(() => {
    setScreen("playing");
    setStage(1);
    setLives(3);
    setDeaths(0);
    setDrumActive(false);
    gameActiveRef.current = true;
    startTimeRef.current = Date.now();
  }, []);

  const handleDeath = useCallback((totalDeaths: number) => {
    setDeaths(totalDeaths);
    setLives((prev) => Math.max(0, prev - 1));
  }, []);

  const handleStageChange = useCallback((newStage: number) => {
    setStage(newStage);
  }, []);

  const handleGameOver = useCallback(
    async (stageReached: number, totalDeaths: number) => {
      setFinalDeaths(totalDeaths);
      setFinalStage(stageReached);
      setFinalCompletionTimeMs(0);
      setScreen("gameover");
      gameActiveRef.current = false;

      if (actor) {
        try {
          await actor.saveGameResult(
            BigInt(stageReached),
            BigInt(totalDeaths),
            0n,
          );
          await loadLeaderboard();
        } catch {
          // Silently fail
        }
      }
    },
    [actor, loadLeaderboard],
  );

  const handleWin = useCallback(
    async (totalDeaths: number) => {
      const elapsedMs =
        startTimeRef.current !== null ? Date.now() - startTimeRef.current : 0;
      setFinalDeaths(totalDeaths);
      setFinalStage(10);
      setFinalCompletionTimeMs(elapsedMs);
      setScreen("win");
      gameActiveRef.current = false;

      if (actor) {
        try {
          await actor.saveGameResult(
            BigInt(10),
            BigInt(totalDeaths),
            BigInt(elapsedMs),
          );
          await loadLeaderboard();
        } catch {
          // Silently fail
        }
      }
    },
    [actor, loadLeaderboard],
  );

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setScreen("playing");
      setStage(1);
      setLives(3);
      setDeaths(0);
      setDrumActive(false);
      gameActiveRef.current = true;
      startTimeRef.current = Date.now();
      setIsLoading(false);
    }, 100);
  }, []);

  const handleCheckpoint = useCallback(() => {
    // Checkpoint activated — just a feedback hook
  }, []);

  const handleDrumPulse = useCallback((active: boolean) => {
    setDrumActive(active);
  }, []);

  // Custom level game over (from playing_custom)
  const handleCustomGameOver = useCallback(
    (_stageReached: number, totalDeaths: number) => {
      setFinalDeaths(totalDeaths);
      setFinalStage(99);
      setScreen("gameover");
      gameActiveRef.current = false;
    },
    [],
  );

  const handleCustomWin = useCallback((totalDeaths: number) => {
    setFinalDeaths(totalDeaths);
    setFinalStage(99);
    setScreen("win");
    gameActiveRef.current = false;
  }, []);

  // Editor handlers
  const handleEditorTest = useCallback((stage: StageConfig) => {
    setCustomStageToPlay(stage);
    setScreen("playing_custom");
    setStage(99);
    setLives(3);
    setDeaths(0);
    setDrumActive(false);
    gameActiveRef.current = true;
  }, []);

  const handleEditorPublish = useCallback(
    async (stage: StageConfig) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCustomLevel(
        stage.name,
        JSON.stringify(stage.platforms),
        BigInt(stage.worldWidth),
        BigInt(stage.bgHue),
      );
      setUserExistingLevel({
        name: stage.name,
        platformsJson: JSON.stringify(stage.platforms),
        worldWidth: stage.worldWidth,
        bgHue: stage.bgHue,
      });
    },
    [actor],
  );

  // Community play handler
  const handlePlayCommunityLevel = useCallback(
    (level: {
      name: string;
      platformsJson: string;
      worldWidth: number;
      bgHue: number;
    }) => {
      const stage = buildCustomStageFromLevel(level);
      setCustomStageToPlay(stage);
      setScreen("playing_custom");
      setStage(99);
      setLives(3);
      setDeaths(0);
      setDrumActive(false);
      gameActiveRef.current = true;
    },
    [],
  );

  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";

  const isCustomLevel = screen === "playing_custom";
  const isGameplaying = screen === "playing" || screen === "playing_custom";
  const isNonGameScreen =
    screen === "editor" || screen === "community" || screen === "leaderboard";

  return (
    <div className="game-container">
      {/* Canvas game - hidden when editor, community, or leaderboard is open */}
      <div
        style={{
          display: isNonGameScreen ? "none" : "block",
          width: "100%",
          height: "100%",
        }}
      >
        <ObbyCoreGame
          onDeath={handleDeath}
          onStageChange={handleStageChange}
          onGameOver={isCustomLevel ? handleCustomGameOver : handleGameOver}
          onWin={isCustomLevel ? handleCustomWin : handleWin}
          onCheckpoint={handleCheckpoint}
          gameActive={isGameplaying}
          drumPulseSignal={handleDrumPulse}
          customStage={
            isCustomLevel ? (customStageToPlay ?? undefined) : undefined
          }
        />
      </div>

      {/* Editor screen */}
      {screen === "editor" && (
        <LevelEditor
          onBack={() => setScreen("start")}
          onTestLevel={handleEditorTest}
          onPublish={handleEditorPublish}
          existingLevel={userExistingLevel}
        />
      )}

      {/* Community screen */}
      {screen === "community" && (
        <CommunityLevels
          onBack={() => setScreen("start")}
          onPlayLevel={handlePlayCommunityLevel}
        />
      )}

      {/* Leaderboard screen */}
      {screen === "leaderboard" && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          speedLeaderboard={speedLeaderboard}
          isLoading={isLeaderboardLoading}
          onBack={() => setScreen("start")}
        />
      )}

      {/* Fog + scanlines overlay (only during gameplay) */}
      {!isNonGameScreen && (
        <>
          <div className="fog-overlay" />
          <div className="scanlines" />
        </>
      )}

      {/* HUD (only during gameplay) */}
      {isGameplaying && (
        <HUD
          stage={stage}
          lives={lives}
          deaths={deaths}
          drumActive={drumActive}
          isCustomLevel={isCustomLevel}
          onMenu={() => {
            gameActiveRef.current = false;
            setScreen("start");
          }}
        />
      )}

      {/* Touch controls (only during gameplay) */}
      {isGameplaying && (
        <TouchControls
          onJump={() => {
            /* jump handled via touch events in canvas */
          }}
        />
      )}

      {/* Screen overlays */}
      {screen === "start" && (
        <StartScreen
          onStart={handleStart}
          onEditor={() => setScreen("editor")}
          onCommunity={() => setScreen("community")}
          onLeaderboard={() => {
            loadLeaderboard();
            setScreen("leaderboard");
          }}
          leaderboard={leaderboard}
          personalBest={personalBest}
          isLoading={isLoading}
        />
      )}

      {screen === "win" && (
        <WinScreen
          deaths={finalDeaths}
          onReplay={isCustomLevel ? () => setScreen("start") : handleRetry}
          leaderboard={leaderboard}
          isCustomLevel={finalStage === 99}
          completionTimeMs={finalCompletionTimeMs}
        />
      )}

      {screen === "gameover" && (
        <GameOverScreen
          deaths={finalDeaths}
          stage={finalStage}
          onRetry={finalStage === 99 ? () => setScreen("start") : handleRetry}
          isCustomLevel={finalStage === 99}
        />
      )}

      {/* Footer */}
      {!isNonGameScreen && (
        <footer className="game-footer">
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with ❤ using caffeine.ai
          </a>
        </footer>
      )}
    </div>
  );
}
