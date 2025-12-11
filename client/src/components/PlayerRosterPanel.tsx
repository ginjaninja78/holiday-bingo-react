import { useState } from "react";
import { X, UserPlus, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Player {
  id: number;
  name: string;
  cardId: string;
  joinedAt: Date;
}

interface PlayerRosterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerRosterPanel({ isOpen, onClose }: PlayerRosterPanelProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerCardId, setNewPlayerCardId] = useState("");

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter player name");
      return;
    }
    if (!newPlayerCardId.trim() || newPlayerCardId.length !== 5) {
      toast.error("Card ID must be 5 characters");
      return;
    }

    const newPlayer: Player = {
      id: Date.now(),
      name: newPlayerName.trim(),
      cardId: newPlayerCardId.toUpperCase(),
      joinedAt: new Date(),
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName("");
    setNewPlayerCardId("");
    toast.success(`${newPlayer.name} added to roster`);
  };

  const handleRemovePlayer = (id: number) => {
    const player = players.find((p) => p.id === id);
    setPlayers(players.filter((p) => p.id !== id));
    toast.success(`${player?.name} removed from roster`);
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
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Player Roster</h2>
            <span className="text-sm text-muted-foreground">({players.length})</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Add Player Form */}
        <div className="border-b p-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardId">Card ID</Label>
            <Input
              id="cardId"
              placeholder="5-character Card ID"
              value={newPlayerCardId}
              onChange={(e) => setNewPlayerCardId(e.target.value.toUpperCase())}
              maxLength={5}
              className="uppercase font-mono text-center"
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
            />
          </div>
          <Button onClick={handleAddPlayer} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Player
          </Button>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {players.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No players yet</p>
              <p className="text-sm">Add players to start tracking</p>
            </div>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Card: {player.cardId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePlayer(player.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
