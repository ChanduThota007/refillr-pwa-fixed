import { useEffect, useState } from "react";

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler as any);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as any);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      const dp = deferredPrompt as any;
      dp.prompt();
      const { outcome } = await dp.userChoice;
      return outcome === "accepted";
    }
    return false;
  };

  return {
    canInstall: !!deferredPrompt,
    promptInstall,
  };
};
