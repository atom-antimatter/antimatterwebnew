"use client";

import { Button } from "@crayonai/react-ui";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useSharedUIState } from "@/app/context/UIStateContext";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import VoiceAgent3DSphere from "@/components/VoiceAgent3DSphere";

export const NavBar = () => {
  const isMobile = useIsMobile();
  const { actions } = useSharedUIState();
  const [canUseWebGL, setCanUseWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setCanUseWebGL(!!gl);
    } catch {
      setCanUseWebGL(false);
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-10 bg-container">
      <div className="flex items-center justify-between px-6 pt-3">
        <div className="flex items-center gap-m">
          <Link
            onClick={() => actions.resetState()}
            href="/atom/search"
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-white/10 overflow-hidden flex items-center justify-center">
              {canUseWebGL ? (
                <VoiceAgent3DSphere
                  isActive={false}
                  isSpeaking={false}
                  minHeight={36}
                  className="w-9 h-9"
                />
              ) : (
                <Image
                  src="/images/glowingCircle2.png"
                  alt="Antimatter orb"
                  width={36}
                  height={36}
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <h1 className="text-primary">Atom</h1>
              <p className="text-secondary">Search</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="medium"
            onClick={() => window.open("/contact?source=atom-search", "_self")}
          >
            Join Waitlist
          </Button>
          {!isMobile && null}
        </div>
      </div>
    </div>
  );
};
