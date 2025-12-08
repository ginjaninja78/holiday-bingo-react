import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Pause, SkipForward, Trophy, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { IMAGE_GALLERY, type GalleryImage } from "@shared/imageGallery";
import { SettingsPanel } from "@/components/SettingsPanel";
import { GameSetupPanel, type GameConfig } from "@/components/GameSetupPanel";

export default function PlayScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImage | null>(null);
  const [playedImages, setPlayedImages] = useState<GalleryImage[]>([]);
  const [remainingImages, setRemainingImages] = useState<GalleryImage[]>([]);
  const [shelfIconSize, setShelfIconSize] = useState(120);
  const [reviewImage, setReviewImage] = useState<GalleryImage | null>(null);
  const [showBingoDialog, setShowBingoDialog] = useState(false);
  const [cardUuid, setCardUuid] = useState("");
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [currentRound, setCurrentRound] = useState(1);

  // Initialize game with shuffled images
  const initializeGame = (config: GameConfig) => {
    const shuffled = [...IMAGE_GALLERY].sort(() => Math.random() - 0.5);
    setRemainingImages(shuffled);
    setPlayedImages([]);
    setCurrentImage(null);
    setGameStarted(true);
    setGameConfig(config);
    setCurrentRound(1);
    toast.success(`Game started! Round 1 of ${config.totalRounds}`);
  };

  // Call next image
  const handleNextImage = () => {
    if (remainingImages.length === 0) {
      toast.info("All images have been called! Start a new round.");
      return;
    }

    const [nextImage, ...rest] = remainingImages;
    
    if (currentImage) {
      setPlayedImages(prev => [...prev, currentImage]);
    }
    
    setCurrentImage(nextImage);
    setRemainingImages(rest);
    setReviewImage(null); // Clear any review image
  };

  // Pause/Resume game
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast.info("Game paused");
    } else {
      toast.success("Game resumed");
      // Return to last played image if reviewing
      if (reviewImage) {
        setReviewImage(null);
      }
    }
  };

  // Review a previous image
  const handleReviewImage = (image: GalleryImage) => {
    if (!isPaused) {
      toast.warning("Pause the game to review previous images");
      return;
    }
    setReviewImage(image);
  };

  // Verify BINGO claim
  const handleVerifyBingo = async () => {
    if (!cardUuid.trim()) {
      toast.error("Please enter a Card ID");
      return;
    }

    // TODO: Implement actual pattern verification logic
    // For now, this is a placeholder that shows the structure
    
    toast.info("Verifying BINGO claim...");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual verification
      // const isValid = await verifyBingoPattern(cardUuid, playedImages, gameConfig);
      
      const isValid = Math.random() > 0.3; // Placeholder: 70% success rate
      
      if (isValid) {
        toast.success("🎉 BINGO! Valid win confirmed!");
        setShowBingoDialog(false);
        setCardUuid("");
      } else {
        toast.error("Invalid BINGO claim. Pattern not complete.");
      }
    } catch (error) {
      toast.error("Failed to verify BINGO");
    }
  };

  const displayImage = reviewImage || currentImage;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Controls */}
      <div className="p-4 glass border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Holiday Bingo</h1>
          {gameStarted && gameConfig && (
            <div className="text-sm text-muted-foreground">
              Round {currentRound} of {gameConfig.totalRounds}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <SettingsPanel />
          {!gameStarted && (
            <GameSetupPanel onStartGame={initializeGame} />
          )}
        </div>
      </div>

      {!gameStarted ? (
        /* Welcome Screen */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-2xl">
            <h2 className="text-4xl font-bold">Welcome, Host!</h2>
            <p className="text-xl text-muted-foreground">
              Click "Setup New Game" to configure your bingo session
            </p>
            <GameSetupPanel onStartGame={initializeGame} />
          </div>
        </div>
      ) : (
        /* Game Screen */
        <div className="flex-1 flex flex-col">
          {/* Played Images Shelf (20% height) */}
          <div className="h-[20vh] border-b glass p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                Played Images ({playedImages.length})
              </h3>
              <div className="flex items-center gap-4">
                <Label className="text-xs">Icon Size</Label>
                <Slider
                  value={[shelfIconSize]}
                  onValueChange={([value]) => setShelfIconSize(value)}
                  min={80}
                  max={200}
                  step={10}
                  className="w-32"
                />
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 h-[calc(100%-2rem)]">
              {playedImages.map((img, idx) => (
                <button
                  key={`${img.id}-${idx}`}
                  onClick={() => handleReviewImage(img)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    reviewImage?.id === img.id
                      ? "border-primary ring-2 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ width: shelfIconSize, height: shelfIconSize }}
                  disabled={!isPaused}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Main Image Display (80% height) */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            {displayImage ? (
              <div className="relative max-w-5xl w-full">
                {reviewImage && (
                  <div className="absolute top-0 left-0 bg-yellow-500 text-black px-4 py-2 rounded-br-lg font-bold z-10">
                    REVIEWING
                  </div>
                )}
                <img
                  src={displayImage.url}
                  alt={displayImage.alt}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {displayImage.alt}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-2xl font-semibold">Click "Next Image" to start calling</p>
                <p className="text-muted-foreground">
                  {remainingImages.length} images remaining
                </p>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-6 glass border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePauseResume}
                variant="outline"
                size="lg"
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </>
                )}
              </Button>

              <Button
                onClick={handleNextImage}
                disabled={isPaused || remainingImages.length === 0}
                size="lg"
              >
                <SkipForward className="mr-2 h-5 w-5" />
                Next Image
              </Button>

              <div className="text-sm text-muted-foreground">
                {remainingImages.length} images remaining
              </div>
            </div>

            <Button
              onClick={() => setShowBingoDialog(true)}
              variant="default"
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Trophy className="mr-2 h-5 w-5" />
              BINGO!
            </Button>
          </div>
        </div>
      )}

      {/* BINGO Verification Dialog */}
      <Dialog open={showBingoDialog} onOpenChange={setShowBingoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify BINGO Claim</DialogTitle>
            <DialogDescription>
              Enter the Card ID from the player's bingo card to verify their win
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardUuid">Card ID</Label>
              <Input
                id="cardUuid"
                placeholder="Enter 5-character Card ID"
                value={cardUuid}
                onChange={(e) => setCardUuid(e.target.value.toUpperCase())}
                maxLength={5}
                className="text-center font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground">
                The Card ID is printed at the top-left of each bingo card
              </p>
            </div>

            {/* TODO: Pattern tracking visualization will go here */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Pattern Verification</p>
              <p className="text-xs text-muted-foreground">
                TODO: Implement pattern tracking mechanism to show which patterns are valid for this round
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowBingoDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyBingo}
                className="flex-1"
                disabled={cardUuid.length !== 5}
              >
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
