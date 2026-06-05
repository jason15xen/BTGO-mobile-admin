"use client";

import { createContext, useContext, useState } from "react";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

// Lets full-screen flows (e.g. the live camera) temporarily hide the bottom nav.
const ImmersiveContext = createContext<(v: boolean) => void>(() => {});
export const useImmersive = () => useContext(ImmersiveContext);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [immersive, setImmersive] = useState(false);
  return (
    <ImmersiveContext.Provider value={setImmersive}>
      <div className="mx-auto w-full max-w-[480px] h-[100dvh] flex flex-col app-surface shadow-2xl overflow-hidden ring-1 ring-black/5">
        <TopNav />
        <main className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">{children}</main>
        {!immersive && <BottomNav />}
      </div>
    </ImmersiveContext.Provider>
  );
}
