"use client";

import { themePresets } from "@crayonai/react-ui/ThemeProvider";
import { ThemeProvider } from "@thesysai/genui-sdk";

import { DesktopResultsView } from "@/app/sections/DesktopResultsView";
import { MobileResultsView } from "@/app/sections/MobileResultsView";

import { NavBar } from "../../components/NavBar/NavBar";
import { UIStateProvider, useSharedUIState } from "../../context/UIStateContext";
import { useIsMobile } from "../../hooks/useIsMobile";
import { LandingView } from "../../sections/LandingView";

import "@crayonai/react-ui/styles/index.css";

const AppContent = () => {
  const isMobile = useIsMobile();
  const { state, currentQuery } = useSharedUIState();
  const hasSearched = !!currentQuery || state.isLoading;

  return (
    <div
      className="flex flex-col justify-center h-screen w-screen relative"
      key={`home-${hasSearched}`}
    >
      {/* Light mode (matches the original working Thesys sample) */}
      <ThemeProvider mode="light" theme={{ ...themePresets.default.theme }}>
        <NavBar />

        {!hasSearched ? (
          <LandingView />
        ) : isMobile ? (
          <MobileResultsView />
        ) : (
          <DesktopResultsView />
        )}
      </ThemeProvider>
    </div>
  );
};

export const App = () => (
  <UIStateProvider>
    <AppContent />
  </UIStateProvider>
);
