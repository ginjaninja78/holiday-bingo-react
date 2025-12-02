import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function JoinGame() {
  const [, params] = useRoute("/join/:sessionCode");
  const sessionCode = params?.sessionCode || "";
  const [, setLocation] = useLocation();

  const [playerName, setPlayerName] = useState("");

  const { data: session } = trpc.game.getSession.useQuery(
    { sessionCode },
    { enabled: !!sessionCode }
  );

  const joinMutation = trpc.game.joinSession.useMutation({
    onSuccess: (data) => {
      // Store player UUID in cookie
      Cookies.set(`player_${sessionCode}`, data.playerUuid, { expires: 1 });
      toast.success("Joined game successfully!");
      setLocation(`/play/${sessionCode}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    joinMutation.mutate({
      sessionCode,
      playerName: playerName.trim(),
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <p className="text-destructive">Session not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-12 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Holiday Bingo
          </h1>
          <p className="text-muted-foreground">
            Join Session: <span className="font-mono font-semibold">{sessionCode}</span>
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-base">
              Your Name
            </Label>
            <Input
              id="playerName"
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={100}
              className="text-lg py-6"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg py-6"
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? "Joining..." : "Join Game"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>No account needed • Just enter your name to play</p>
        </div>
      </div>
    </div>
  );
}
