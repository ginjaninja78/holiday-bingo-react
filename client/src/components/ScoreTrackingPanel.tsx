import { useState } from "react";
import { X, Trophy, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerScore {
  id: number;
  name: string;
  cardId: string;
  wins: number;
  lastWin?: Date;
}

interface ScoreTrackingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreTrackingPanel({ isOpen, onClose }: ScoreTrackingPanelProps) {
  // Mock data - will be replaced with actual game data
  const [scores] = useState<PlayerScore[]>([
    { id: 1, name: "Alice Johnson", cardId: "ABC12", wins: 3, lastWin: new Date() },
    { id: 2, name: "Bob Smith", cardId: "XYZ98", wins: 2 },
    { id: 3, name: "Carol Davis", cardId: "MNO45", wins: 2 },
    { id: 4, name: "David Lee", cardId: "PQR67", wins: 1 },
    { id: 5, name: "Eve Martinez", cardId: "STU23", wins: 1 },
  ].sort((a, b) => b.wins - a.wins));

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-background shadow-xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Leaderboard</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {scores.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No wins yet</p>
              <p className="text-sm">Start playing to see scores</p>
            </div>
          ) : (
            scores.map((score, index) => (
              <div
                key={score.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  index < 3 ? "bg-accent/30" : "hover:bg-accent/50"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                  {index < 3 ? getMedalIcon(index) : index + 1}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <p className="font-medium">{score.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Card: {score.cardId}
                  </p>
                </div>

                {/* Wins */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{score.wins}</p>
                  <p className="text-xs text-muted-foreground">
                    {score.wins === 1 ? "win" : "wins"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t p-4 bg-muted/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{scores.length}</p>
              <p className="text-xs text-muted-foreground">Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {scores.reduce((sum, s) => sum + s.wins, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {Math.max(...scores.map((s) => s.wins), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Top Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
