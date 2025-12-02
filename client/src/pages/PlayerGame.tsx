import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { BingoCard } from "@/components/BingoCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import type { WSMessage } from "../../../shared/gameTypes";
import Cookies from "js-cookie";

export default function PlayerGame() {
  const [, params] = useRoute("/play/:sessionCode");
  const sessionCode = params?.sessionCode || "";
  const [, setLocation] = useLocation();

  const [playerUuid, setPlayerUuid] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [calledImages, setCalledImages] = useState<number[]>([]);

  const { data: session } = trpc.game.getSession.useQuery(
    { sessionCode },
    { enabled: !!sessionCode }
  );

  const { data: imageCatalog = [] } = trpc.game.getImageCatalog.useQuery();

  const { data: calledImagesData } = trpc.game.getCalledImages.useQuery(
    {
      sessionId: session?.id || 0,
      roundNumber: session?.currentRound || 0,
    },
    { enabled: !!session?.id && session.currentRound > 0 }
  );

  const claimBingoMutation = trpc.game.claimBingo.useMutation({
    onSuccess: () => {
      toast.success("Bingo claimed! Waiting for host verification...");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Load player UUID from cookie
  useEffect(() => {
    const storedUuid = Cookies.get(`player_${sessionCode}`);
    if (storedUuid) {
      setPlayerUuid(storedUuid);
    } else {
      setLocation(`/join/${sessionCode}`);
    }
  }, [sessionCode, setLocation]);

  // Initialize WebSocket
  useEffect(() => {
    if (!sessionCode) return;

    const newSocket = io({
      path: "/api/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Connected to game server");
      newSocket.emit("join_session", sessionCode);
    });

    newSocket.on("game_event", (message: WSMessage) => {
      console.log("Game event:", message);

      switch (message.type) {
        case "image_called":
          const payload = message.payload as { imageId: number; description: string };
          setCalledImages((prev) => [...prev, payload.imageId]);
          toast.info(`Called: ${payload.description}`);
          break;

        case "round_started":
          toast.success("New round started!");
          setCalledImages([]);
          break;

        case "round_ended":
          toast.info("Round ended");
          break;

        case "game_reset":
          toast.info("Game has been reset");
          setCalledImages([]);
          break;
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionCode]);

  // Update called images from query
  useEffect(() => {
    if (calledImagesData) {
      setCalledImages(calledImagesData.map((ci) => ci.imageId));
    }
  }, [calledImagesData]);

  const handleClaimBingo = () => {
    if (!playerUuid) return;
    claimBingoMutation.mutate({ playerUuid });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Holiday Bingo
          </h1>
          <p className="text-muted-foreground">
            Session: <span className="font-mono font-semibold">{sessionCode}</span>
          </p>
          {session.currentRound > 0 && (
            <p className="text-sm text-muted-foreground">
              Round {session.currentRound} • {session.status}
            </p>
          )}
        </div>

        {/* Bingo Card */}
        {session.currentRound > 0 && playerUuid ? (
          <div className="space-y-6">
            <BingoCard
              playerUuid={playerUuid}
              roundNumber={session.currentRound}
              calledImageIds={calledImages}
              imageCatalog={imageCatalog}
            />

            {/* Claim Bingo Button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleClaimBingo}
                disabled={claimBingoMutation.isPending}
                className="text-xl px-12 py-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                🎉 BINGO! 🎉
              </Button>
            </div>

            {/* Called Images Strip */}
            {calledImages.length > 0 && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Called Images ({calledImages.length})
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {calledImages.map((imageId) => {
                    const image = imageCatalog.find((img) => img.id === imageId);
                    return image ? (
                      <div
                        key={imageId}
                        className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-white/40"
                      >
                        <img
                          src={image.path}
                          alt={image.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-xl text-muted-foreground">
              Waiting for host to start the round...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
