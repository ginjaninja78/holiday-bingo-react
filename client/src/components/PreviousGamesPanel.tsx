import { useState } from "react";
import { X, History, ChevronDown, ChevronRight, Trophy, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PreviousGamesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ArchivedGame {
  id: number;
  gameName: string;
  totalRounds: number;
  completedRounds: number;
  patterns: string[];
  startedAt: Date;
  endedAt: Date;
  playerScores: {
    playerUuid: string;
    playerName: string;
    wins: number;
    patternsWon: string[];
  }[];
  playedImages: {
    imageLabel: string;
    orderIndex: number;
  }[];
}

export function PreviousGamesPanel({ isOpen, onClose }: PreviousGamesPanelProps) {
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [gameToDelete, setGameToDelete] = useState<number | null>(null);

  // Mock data - will be replaced with tRPC query
  const archivedGames: ArchivedGame[] = [
    {
      id: 1,
      gameName: "Holiday Party 2025",
      totalRounds: 3,
      completedRounds: 3,
      patterns: ["LINE", "DIAGONAL", "BLACKOUT"],
      startedAt: new Date("2025-12-10T14:00:00"),
      endedAt: new Date("2025-12-10T16:30:00"),
      playerScores: [
        {
          playerUuid: "player-1",
          playerName: "Alice Johnson",
          wins: 2,
          patternsWon: ["LINE", "DIAGONAL"],
        },
        {
          playerUuid: "player-2",
          playerName: "Bob Smith",
          wins: 1,
          patternsWon: ["BLACKOUT"],
        },
      ],
      playedImages: [
        { imageLabel: "Snowflake", orderIndex: 1 },
        { imageLabel: "Hot Chocolate", orderIndex: 2 },
        { imageLabel: "Winter Cabin", orderIndex: 3 },
      ],
    },
  ];

  const toggleExpand = (gameId: number) => {
    setExpandedGame(expandedGame === gameId ? null : gameId);
  };

  const handleDeleteGame = (gameId: number) => {
    setGameToDelete(gameId);
  };

  const confirmDelete = () => {
    if (gameToDelete === null) return;
    // TODO: Call tRPC mutation to delete game
    toast.success("Game deleted from history");
    setGameToDelete(null);
  };

  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Panel */}
        <div className="relative ml-auto w-full max-w-3xl bg-background shadow-xl flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Previous Games</h2>
              <span className="text-sm text-muted-foreground">({archivedGames.length})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Games List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {archivedGames.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No previous games</p>
                <p className="text-sm">Completed games will appear here</p>
              </div>
            ) : (
              archivedGames.map((game) => (
                <div key={game.id} className="border rounded-lg overflow-hidden">
                  {/* Game Summary */}
                  <div className="p-4 bg-accent/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(game.id)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedGame === game.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <h3 className="font-semibold">{game.gameName || "Untitled Game"}</h3>
                        </div>
                        
                        <div className="mt-2 ml-8 space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {game.endedAt.toLocaleDateString()} • {formatDuration(game.startedAt, game.endedAt)}
                            </span>
                          </div>
                          <div>
                            {game.completedRounds} of {game.totalRounds} rounds • {game.patterns.join(", ")}
                          </div>
                          <div>
                            {game.playerScores.length} player{game.playerScores.length !== 1 ? "s" : ""} • {game.playedImages.length} images called
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedGame === game.id && (
                    <div className="p-4 space-y-4 border-t">
                      {/* Player Scores */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Player Scores
                        </h4>
                        <div className="space-y-2">
                          {game.playerScores
                            .sort((a, b) => b.wins - a.wins)
                            .map((score, index) => (
                              <div
                                key={score.playerUuid}
                                className="flex items-center justify-between p-2 border rounded"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium">{score.playerName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {score.patternsWon.join(", ")}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">{score.wins}</p>
                                  <p className="text-xs text-muted-foreground">
                                    win{score.wins !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Played Images */}
                      <div>
                        <h4 className="font-semibold mb-2">Images Called ({game.playedImages.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {game.playedImages
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((image) => (
                              <div
                                key={image.orderIndex}
                                className="px-2 py-1 bg-muted rounded text-sm"
                              >
                                {image.orderIndex}. {image.imageLabel}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={gameToDelete !== null} onOpenChange={() => setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game from History?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The game data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
