import { useState, useRef } from "react";
import { X, Users, Upload, Download, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { trpc } from "@/lib/trpc";

interface PlayerManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerManagementPanel({ isOpen, onClose }: PlayerManagementPanelProps) {
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - will be replaced with tRPC query
  const players = [
    { uuid: "player-uuid-1", name: "Alice Johnson", cardCount: 5 },
    { uuid: "player-uuid-2", name: "Bob Smith", cardCount: 3 },
    { uuid: "player-uuid-3", name: null, cardCount: 10 }, // Unnamed player
  ];

  const handleSelectPlayer = (uuid: string) => {
    if (isMultiSelect) {
      const newSelected = new Set(selectedPlayers);
      if (newSelected.has(uuid)) {
        newSelected.delete(uuid);
      } else {
        newSelected.add(uuid);
      }
      setSelectedPlayers(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === players.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(players.map((p) => p.uuid)));
    }
  };

  const handleCreatePlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    // TODO: Call tRPC mutation to create player
    toast.success(`Player "${newPlayerName}" created`);
    setNewPlayerName("");
  };

  const handleDeleteSelected = () => {
    if (selectedPlayers.size === 0) {
      toast.error("No players selected");
      return;
    }
    // TODO: Call tRPC mutation to delete players
    toast.success(`${selectedPlayers.size} player(s) deleted`);
    setSelectedPlayers(new Set());
  };

  const handleExportCSV = () => {
    if (selectedPlayers.size === 0) {
      toast.error("No players selected for export");
      return;
    }
    setShowExportDialog(true);
  };

  const confirmExport = () => {
    // TODO: Call tRPC query to generate CSV data
    const csvContent = "player_uuid,name,card_ids\n";
    // Add player data...
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `players-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedPlayers.size} player(s)`);
    setShowExportDialog(false);
    setIsMultiSelect(false);
    setSelectedPlayers(new Set());
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // TODO: Parse CSV and call tRPC mutation to import
      const lines = text.split("\n");
      toast.success(`Importing ${lines.length - 1} player(s)...`);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Panel */}
        <div className="relative ml-auto w-full max-w-2xl bg-background shadow-xl flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Player Management</h2>
              <span className="text-sm text-muted-foreground">({players.length})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Toolbar */}
          <div className="border-b p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={isMultiSelect ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsMultiSelect(!isMultiSelect);
                  setSelectedPlayers(new Set());
                }}
              >
                {isMultiSelect ? "Cancel Select" : "Multi-Select"}
              </Button>
              
              {isMultiSelect && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedPlayers.size === players.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={selectedPlayers.size === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedPlayers.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={selectedPlayers.size === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export ({selectedPlayers.size})
                  </Button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </div>

            {/* Create Player Form */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlayer()}
                className="flex-1"
              />
              <Button onClick={handleCreatePlayer}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {/* Player Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {players.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No players yet</p>
                <p className="text-sm">Create a player or import from CSV</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {players.map((player) => (
                  <div
                    key={player.uuid}
                    onClick={() => handleSelectPlayer(player.uuid)}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlayers.has(player.uuid)
                        ? "border-primary bg-primary/10"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {isMultiSelect && (
                      <div className="absolute top-2 right-2">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedPlayers.has(player.uuid)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedPlayers.has(player.uuid) && (
                            <svg
                              className="w-3 h-3 text-primary-foreground"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <p className="font-medium truncate">
                        {player.name || (
                          <span className="text-muted-foreground italic">Unnamed Player</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        UUID: {player.uuid.slice(0, 12)}...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {player.cardCount} card{player.cardCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Confirmation Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Players to CSV</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to export {selectedPlayers.size} player(s) to a CSV file.
              The file will include player UUIDs, names, and card IDs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExport}>
              Export {selectedPlayers.size} Player{selectedPlayers.size !== 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
