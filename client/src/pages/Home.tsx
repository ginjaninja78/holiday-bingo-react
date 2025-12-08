import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Snowflake } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleHostGame = () => {
    if (user) {
      setLocation("/host");
    } else {
      window.location.href = getLoginUrl();
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Snowflake className="w-12 h-12 text-primary animate-spin-slow" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Holiday Bingo
            </h1>
            <Snowflake className="w-12 h-12 text-accent animate-spin-slow" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A festive, corporate-friendly bingo game perfect for holiday parties and team events
          </p>
        </div>

        {/* Main Actions */}
        <div className="flex justify-center mb-12">
          {/* Host Game Card - Centered */}
          <div className="glass rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎮</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Host a Game</h2>
              <p className="text-muted-foreground">
                Create a session and manage the game as host
              </p>
            </div>
            <Button
              onClick={handleHostGame}
              size="lg"
              className="w-full text-lg py-6"
              disabled={loading}
            >
              {user ? "Go to Host Dashboard" : "Sign In to Host"}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Features</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">❄️</div>
              <h4 className="font-semibold mb-1">Winter Themed</h4>
              <p className="text-sm text-muted-foreground">
                Beautiful, corporate-safe holiday imagery
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-1">Real-time Play</h4>
              <p className="text-sm text-muted-foreground">
                Instant updates for all players
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-1">Secure & Fair</h4>
              <p className="text-sm text-muted-foreground">
                Built-in anti-cheat validation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
