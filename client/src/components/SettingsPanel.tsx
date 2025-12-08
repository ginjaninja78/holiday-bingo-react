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
import { Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SettingsPanelProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
  const [unsplashApiKey, setUnsplashApiKey] = useState("");
  const [searchTags, setSearchTags] = useState("winter holiday snow christmas kwanzaa solstice");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshGallery = async () => {
    try {
      // TODO: Implement Unsplash API integration
      toast.info("Unsplash integration coming soon! Add your API key to enable.");
    } catch (error) {
      toast.error("Failed to refresh gallery");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your Holiday Bingo game settings
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Unsplash Integration */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Unsplash Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Unsplash API to automatically refresh the image gallery with high-quality photos.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unsplashApiKey">Unsplash API Key</Label>
              <Input
                id="unsplashApiKey"
                type="password"
                placeholder="Enter your Unsplash API key"
                value={unsplashApiKey}
                onChange={(e) => setUnsplashApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://unsplash.com/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Unsplash Developers
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchTags">Search Tags</Label>
              <Input
                id="searchTags"
                type="text"
                placeholder="winter holiday snow christmas"
                value={searchTags}
                onChange={(e) => setSearchTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Space-separated tags for image search. Avoid religious iconography.
              </p>
            </div>

            <Button
              onClick={handleRefreshGallery}
              className="w-full"
              variant="secondary"
              disabled={!unsplashApiKey}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Gallery (Replace Oldest 20)
            </Button>
          </div>

          {/* Gallery Stats */}
          <div className="space-y-2 p-4 glass rounded-lg">
            <h4 className="font-semibold">Gallery Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Images</p>
                <p className="text-2xl font-bold">40</p>
              </div>
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="text-lg font-semibold">AI Generated</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
