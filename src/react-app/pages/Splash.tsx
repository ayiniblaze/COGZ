import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/react-app/components/ui/button";

export default function SplashPage() {
  const navigate = useNavigate();
  const [hasImage, setHasImage] = useState(true);

  useEffect(() => {
    // Preload so we can cleanly fall back if missing.
    const img = new Image();
    img.onload = () => setHasImage(true);
    img.onerror = () => setHasImage(false);
    img.src = "/splash.png";
  }, []);

  if (!hasImage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900">COGZ</h1>
          <p className="text-sm text-slate-600">
            Splash image not found. Add it as <span className="font-mono">public/splash.png</span>.
          </p>
          <Button onClick={() => navigate("/start")}>Access</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full">
        <img
          src="/splash.png"
          alt="COGZ access screen"
          className="w-full h-auto select-none"
          draggable={false}
          onError={() => setHasImage(false)}
        />

        {/* Accessible overlay control */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={() => navigate("/start")}
            size="lg"
            className="px-10"
            aria-label="Access COGZ"
          >
            ACCESS
          </Button>
        </div>
      </div>
    </div>
  );
}
