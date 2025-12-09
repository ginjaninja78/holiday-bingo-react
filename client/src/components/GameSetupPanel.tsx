import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gamepad2, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface GameSetupPanelProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStartGame?: (config: GameConfig) => void;
}

export interface GameConfig {
  totalRounds: number;
  winsPerRound: number;
  roundPatterns: PatternConfig[];
  numPlayers: number;
  numGames: number;
}

export interface PatternConfig {
  roundNumber: number;
  patterns: string[]; // Array of pattern types
}

const PATTERN_OPTIONS = [
  { value: "line", label: "Line (Horizontal/Vertical)", icon: "━" },
  { value: "diagonal", label: "Diagonal", icon: "╲" },
  { value: "four_corners", label: "Four Corners", icon: "┼" },
  { value: "x_pattern", label: "X Pattern", icon: "✕" },
  { value: "blackout", label: "Blackout (Full Card)", icon: "■" },
];

export function GameSetupPanel({ isOpen, onOpenChange, onStartGame }: GameSetupPanelProps) {
  const [totalRounds, setTotalRounds] = useState(1);
  const [winsPerRound, setWinsPerRound] = useState(1);
  const [numPlayers, setNumPlayers] = useState(20);
  const [numGames, setNumGames] = useState(1);
  const [roundPatterns, setRoundPatterns] = useState<PatternConfig[]>([
    { roundNumber: 1, patterns: ["line"] }
  ]);

  const handleRoundsChange = (rounds: number) => {
    setTotalRounds(rounds);
    // Update round patterns array
    const newPatterns: PatternConfig[] = [];
    for (let i = 1; i <= rounds; i++) {
      const existing = roundPatterns.find(p => p.roundNumber === i);
      newPatterns.push(existing || { roundNumber: i, patterns: ["line"] });
    }
    setRoundPatterns(newPatterns);
  };

  const handlePatternToggle = (roundNumber: number, pattern: string) => {
    setRoundPatterns(prev => prev.map(rp => {
      if (rp.roundNumber === roundNumber) {
        const patterns = rp.patterns.includes(pattern)
          ? rp.patterns.filter(p => p !== pattern)
          : [...rp.patterns, pattern];
        return { ...rp, patterns };
      }
      return rp;
    }));
  };

  const generatePDFMutation = trpc.pdf.generateMultipleCards.useMutation();

  const handleGeneratePDFs = async () => {
    if (numPlayers < 1 || numGames < 1) {
      toast.error("Please enter valid numbers for players and games");
      return;
    }

    const totalCards = numPlayers * numGames;
    toast.info(`Generating ${totalCards} bingo cards...`);
    
    try {
      const result = await generatePDFMutation.mutateAsync({
        count: totalCards,
        gamesPerPlayer: numGames,
      });

      console.log("[PDF Download] Result:", {
        success: result.success,
        fileName: result.fileName,
        cardIds: result.cardIds,
        totalPages: result.totalPages,
        pdfDataLength: result.pdfData?.length || 0,
        pdfDataPreview: result.pdfData?.substring(0, 50),
      });

      if (!result.pdfData) {
        throw new Error("No PDF data received from server");
      }

      // Convert base64 to blob and trigger download
      console.log("[PDF Download] Converting base64 to blob...");
      const byteCharacters = atob(result.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      console.log("[PDF Download] Blob created:", {
        size: blob.size,
        type: blob.type,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName || "bingo-cards.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Generated ${totalCards} cards in ${result.totalPages} pages. Download started!`
      );
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDFs. Please try again.");
    }
  };

  const handleStartGame = () => {
    const config: GameConfig = {
      totalRounds,
      winsPerRound,
      roundPatterns,
      numPlayers,
      numGames,
    };
    
    onStartGame?.(config);
    toast.success("Game started!");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="default" size="lg">
          <Gamepad2 className="mr-2 h-5 w-5" />
          Setup New Game
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Game Setup</SheetTitle>
          <SheetDescription>
            Configure rounds, patterns, and generate player cards
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Game Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalRounds">Total Rounds</Label>
                <Input
                  id="totalRounds"
                  type="number"
                  min="1"
                  max="10"
                  value={totalRounds}
                  onChange={(e) => handleRoundsChange(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="winsPerRound">Wins Per Round</Label>
                <Input
                  id="winsPerRound"
                  type="number"
                  min="1"
                  max="5"
                  value={winsPerRound}
                  onChange={(e) => setWinsPerRound(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Pattern Selection Per Round */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Winning Patterns</h3>
            <p className="text-sm text-muted-foreground">
              Select one or more patterns for each round
            </p>

            {roundPatterns.map((roundConfig) => (
              <div key={roundConfig.roundNumber} className="p-4 glass rounded-lg space-y-3">
                <h4 className="font-semibold">Round {roundConfig.roundNumber}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PATTERN_OPTIONS.map((pattern) => (
                    <Button
                      key={pattern.value}
                      variant={roundConfig.patterns.includes(pattern.value) ? "default" : "outline"}
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => handlePatternToggle(roundConfig.roundNumber, pattern.value)}
                    >
                      <span className="text-xl mr-2">{pattern.icon}</span>
                      <span className="text-xs">{pattern.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* PDF Card Generation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generate Player Cards</h3>
            <p className="text-sm text-muted-foreground">
              Create PDF files for physical bingo cards
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numPlayers">Number of Players</Label>
                <Input
                  id="numPlayers"
                  type="number"
                  min="1"
                  max="500"
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numGames">Games Per Player</Label>
                <Input
                  id="numGames"
                  type="number"
                  min="1"
                  max="20"
                  value={numGames}
                  onChange={(e) => setNumGames(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-1">Output:</p>
              <p>{numPlayers} PDF files × {numGames} pages each</p>
              <p className="text-xs text-muted-foreground mt-1">
                Each page has a unique Card ID for verification
              </p>
            </div>

            <Button
              onClick={handleGeneratePDFs}
              className="w-full"
              variant="secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Generate PDF Cards
            </Button>
          </div>

          {/* Start Game Button */}
          <Button
            onClick={handleStartGame}
            className="w-full"
            size="lg"
          >
            <Gamepad2 className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
