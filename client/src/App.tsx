import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import JoinGame from "./pages/JoinGame";
import PlayerGame from "./pages/PlayerGame";
import HostGame from "./pages/HostGame";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/join/:sessionCode"} component={JoinGame} />
      <Route path={"/play/:sessionCode"} component={PlayerGame} />
      <Route path={"/host"} component={HostGame} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
