import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

// ===================================================
// TYPES
// ===================================================

interface CommunityLevelItem {
  id: string;
  name: string;
  author: string;
  platformsJson: string;
  worldWidth: number;
  bgHue: number;
  createdAt: bigint;
}

interface CommunityLevelsProps {
  onBack: () => void;
  onPlayLevel: (level: {
    name: string;
    platformsJson: string;
    worldWidth: number;
    bgHue: number;
  }) => void;
}

// ===================================================
// COMPONENT
// ===================================================

export default function CommunityLevels({
  onBack,
  onPlayLevel,
}: CommunityLevelsProps) {
  const { actor } = useActor();
  const [levels, setLevels] = useState<CommunityLevelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    setIsLoading(true);
    actor
      .getPublicLevels()
      .then((rawLevels) => {
        const parsed: CommunityLevelItem[] = rawLevels.map((lvl) => ({
          id: lvl.id.toString(),
          name: lvl.name || "Unnamed Level",
          author: lvl.author.toString(),
          platformsJson: lvl.platformsJson,
          worldWidth: Number(lvl.worldWidth),
          bgHue: Number(lvl.bgHue),
          createdAt: lvl.createdAt,
        }));
        // Sort newest first
        parsed.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setLevels(parsed);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load community levels.");
        setIsLoading(false);
      });
  }, [actor]);

  const formatAuthor = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 8)}…${principal.slice(-4)}`;
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(5, 3, 15, 0.97)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Bricolage Grotesque', sans-serif",
        zIndex: 30,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(10, 5, 25, 0.97)",
          borderBottom: "1px solid rgba(168,85,247,0.2)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="community.back_button"
          style={{
            padding: "8px 18px",
            background: "rgba(168,85,247,0.1)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: 6,
            color: "rgba(200,180,255,0.8)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          ← Back
        </button>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(18px, 3vw, 28px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "linear-gradient(135deg, #e879f9, #a855f7, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🌐 Community Levels
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "rgba(200,180,255,0.5)",
              marginTop: 2,
            }}
          >
            Play levels created by the community
          </p>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          maxWidth: 860,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <div
            data-ocid="community.loading_state"
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "rgba(168,85,247,0.6)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(168,85,247,0.2)",
                borderTopColor: "#a855f7",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Loading levels...
            </div>
            <style>
              {"@keyframes spin { to { transform: rotate(360deg); } }"}
            </style>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div
            data-ocid="community.error_state"
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "rgba(248,113,113,0.8)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{error}</div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && levels.length === 0 && (
          <div
            data-ocid="community.empty_state"
            style={{
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>
              🏗️
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "rgba(200,180,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              No community levels yet
            </div>
            <div style={{ fontSize: 13, color: "rgba(200,180,255,0.4)" }}>
              Be the first to publish one! Use the Level Editor to build and
              share your creation.
            </div>
          </div>
        )}

        {/* Level cards */}
        {!isLoading && !error && levels.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {levels.map((level, index) => (
              <div
                key={level.id}
                data-ocid={`community.level.item.${index + 1}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  background: "rgba(168,85,247,0.05)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  borderRadius: 10,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {/* Hue badge */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, hsl(${level.bgHue}, 70%, 20%), hsl(${level.bgHue + 40}, 60%, 10%))`,
                    border: `1px solid hsl(${level.bgHue}, 60%, 35%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🎮
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#e0d0ff",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {level.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(200,180,255,0.45)",
                      fontFamily: "'Sora', monospace",
                      marginTop: 3,
                    }}
                  >
                    by {formatAuthor(level.author)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        padding: "2px 6px",
                        background: "rgba(168,85,247,0.1)",
                        border: "1px solid rgba(168,85,247,0.2)",
                        borderRadius: 4,
                        color: "rgba(168,85,247,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {level.worldWidth}px wide
                    </span>
                  </div>
                </div>

                {/* Play button */}
                <button
                  type="button"
                  onClick={() =>
                    onPlayLevel({
                      name: level.name,
                      platformsJson: level.platformsJson,
                      worldWidth: level.worldWidth,
                      bgHue: level.bgHue,
                    })
                  }
                  data-ocid={`community.play_button.${index + 1}`}
                  style={{
                    padding: "10px 22px",
                    background: "linear-gradient(135deg, #a855f7, #e879f9)",
                    border: "none",
                    borderRadius: 8,
                    color: "#05030f",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    boxShadow: "0 0 20px rgba(168,85,247,0.3)",
                    transition: "transform 0.1s, box-shadow 0.1s",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
