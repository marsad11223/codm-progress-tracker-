"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "camo-command-install-dismissed";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function Pwa() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (isStandalone()) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (isIos()) setIosHint(true);

    function onPrompt(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!iosHint && !prompt) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setPrompt(null);
      setIosHint(false);
    }
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setPrompt(null);
    setIosHint(false);
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
      <p className="min-w-0 flex-1 text-muted-foreground">
        {prompt
          ? "Install Camo Command so it opens like an app."
          : "On iPhone, tap Share, then Add to Home Screen."}
      </p>
      {prompt ? (
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground"
        >
          Install
        </button>
      ) : null}
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 px-1 text-muted-foreground"
        aria-label="Dismiss install hint"
      >
        ✕
      </button>
    </div>
  );
}
