import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "napnest_install_dismissed";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

export const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Don't show in iframes or preview hosts
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }
    if (
      window.location.hostname.includes("id-preview--") ||
      window.location.hostname.includes("lovableproject.com")
    ) return;

    // Already installed as PWA
    if (isStandalone()) return;

    // Check 30-day dismiss
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < THIRTY_DAYS) return;

    // iOS Safari path
    if (isIOS()) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    // Android/Chrome path
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !isMobile) return null;

  return (
    <div className="fixed bottom-20 left-2 right-2 z-50 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {platform === "ios" ? (
            <p className="text-sm font-medium text-foreground">
              Tap <Share className="inline w-4 h-4 -mt-0.5 text-primary" /> then <span className="font-semibold">"Add to Home Screen"</span> for quick 2am access
            </p>
          ) : (
            <p className="text-sm font-medium text-foreground">
              Add NapNest to your home screen for quick 2am access
            </p>
          )}
        </div>
        {platform === "android" && (
          <Button size="sm" onClick={handleInstall} className="shrink-0 gap-1.5">
            <Download className="w-4 h-4" />
            Install
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
