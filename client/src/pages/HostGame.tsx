import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { Menu, Play, Square, RotateCcw, Plus } from "lucide-react";
import type { WSMessage } from "../../../shared/gameTypes";

export default function HostGame() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionCode, setSessionCode] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const { data: session, refetch: refetchSession } = trpc.game.getSession.useQuery(
    { sessionCode },
    { enabled: !!sessionCode }
  );

  const { data: imageCatalog = [] } = trpc.game.getImageCatalog.useQuery();

  const { data: calledImages = [] } = trpc.game.getCalledImages.useQuery(
    {
      sessionId: sessionId || 0,
      roundNumber: session?.currentRound || 0,
    },
    { enabled: !!sessionId && !!session?.currentRound }
  );

  const { data: scoreboard = [] } = trpc.game.getScoreboard.useQuery(
    { sessionId: sessionId || 0 },
    { enabled: !!sessionId }
  );

  const createSessionMutation = trpc.game.createSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setSessionCode(data.sessionCode);
      toast.success(`Session created: ${data.sessionCode}`);
    },
  });

  const startRoundMutation = trpc.game.startRound.useMutation({
    onSuccess: () => {
      refetchSession();
      toast.success("Round started!");
    },
  });

  const callImageMutation = trpc.game.callImage.useMutation({
    onSuccess: () => {
      setSelectedImageId(null);
      toast.success("Image called!");
    },
  });

  const endRoundMutation = trpc.game.endRound.useMutation({
    onSuccess: () => {
      refetchSession();
      toast.info("Round ended");
    },
  });

  const resetGameMutation = trpc.game.resetGame.useMutation({
    onSuccess: () => {
      refetchSession();
      toast.info("Game reset");
    },
  });

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  // Initialize WebSocket
  useEffect(() => {
    if (!sessionCode) return;

    const newSocket = io({
      path: "/api/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Host connected to game server");
      newSocket.emit("join_as_host", sessionCode);
    });

    newSocket.on("host_event", (message: WSMessage) => {
      console.log("Host event:", message);

      if (message.type === "bingo_claimed") {
        const payload = message.payload as { playerName: string };
        toast.success(`${payload.playerName} claimed BINGO!`, {
          duration: 10000,
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionCode]);

  const handleCreateSession = () => {
    createSessionMutation.mutate({});
  };

  const handleStartRound = () => {
    if (!sessionId) return;
    startRoundMutation.mutate({ sessionId });
  };

  const handleCallImage = (imageId: number) => {
    if (!sessionId) return;
    callImageMutation.mutate({ sessionId, imageId });
  };

  const handleEndRound = () => {
    if (!sessionId) return;
    endRoundMutation.mutate({ sessionId });
  };

  const handleResetGame = () => {
    if (!sessionId) return;
    resetGameMutation.mutate({ sessionId });
  };

  const calledImageIds = calledImages.map((ci) => ci.imageId);
  const availableImages = imageCatalog.filter(
    (img) => !calledImageIds.includes(img.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Host Dashboard
            </h1>
            {sessionCode && (
              <p className="text-muted-foreground mt-2">
                Session: <span className="font-mono font-semibold text-lg">{sessionCode}</span>
              </p>
            )}
          </div>

          {/* Admin Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" variant="outline" className="gap-2">
                <Menu className="w-5 h-5" />
                Controls
              </Button>
            </SheetTrigger>
            <SheetContent className="w-96 animate-slide-in-right">
              <SheetHeader>
                <SheetTitle>Game Controls</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {!sessionCode ? (
                  <Button
                    onClick={handleCreateSession}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Session
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleStartRound}
                      className="w-full gap-2"
                      size="lg"
                      disabled={session?.status === "active"}
                    >
                      <Play className="w-5 h-5" />
                      Start Round
                    </Button>

                    <Button
                      onClick={handleEndRound}
                      variant="secondary"
                      className="w-full gap-2"
                      disabled={session?.status !== "active"}
                    >
                      <Square className="w-5 h-5" />
                      End Round
                    </Button>

                    <Button
                      onClick={handleResetGame}
                      variant="destructive"
                      className="w-full gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset Game
                    </Button>
                  </>
                )}

                {/* Scoreboard */}
                {scoreboard.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-semibold mb-3">Scoreboard</h3>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {scoreboard.map((player) => (
                          <Card key={player.id} className="p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{player.playerName}</span>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-semibold">{player.totalBingos}</span> bingos
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {!sessionCode ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-xl text-muted-foreground mb-6">
              Create a session to start hosting
            </p>
            <Button onClick={handleCreateSession} size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create New Session
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Called Image Display */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Current Image</h2>
              {selectedImageId ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-xl overflow-hidden border-4 border-primary/40">
                    <img
                      src={imageCatalog.find((img) => img.id === selectedImageId)?.path}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center text-lg font-medium">
                    {imageCatalog.find((img) => img.id === selectedImageId)?.description}
                  </p>
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center">
                  <p className="text-muted-foreground">No image selected</p>
                </div>
              )}
            </div>

            {/* Image Selection Grid */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4">
                Select Image to Call ({availableImages.length} remaining)
              </h2>
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-4 gap-2">
                  {availableImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        setSelectedImageId(image.id);
                        handleCallImage(image.id);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-white/40 hover:border-primary/60 transition-all hover:scale-105"
                    >
                      <img
                        src={image.path}
                        alt={image.description}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
