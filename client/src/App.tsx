import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GameMode from "@/pages/game-mode";
import PlayerSelection from "@/pages/player-selection";
import GameStart from "@/pages/game-start";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game-mode" component={GameMode} />
      <Route path="/player-selection" component={PlayerSelection} />
      <Route path="/game-start" component={GameStart} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
