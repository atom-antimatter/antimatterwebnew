import clsx from "clsx";
import React from "react";

import { useSharedUIState } from "@/app/context/UIStateContext";
import { useIsMobile } from "@/app/hooks/useIsMobile";

import { SearchInput } from "../../components/SearchInput";

import styles from "./LandingView.module.scss";

export const LandingView = () => {
  const isMobile = useIsMobile();
  const { state, handleSearch } = useSharedUIState();

  return (
    <>
      <div
        className={clsx(
          "flex flex-col items-center justify-center -mt-[60px] relative z-10",
          isMobile && "mx-5",
        )}
      >
        <div className="flex mb-xl">
          <h1
            className={clsx(
              "text-size-heading",
              "font-medium select-none",
              isMobile ? "text-[34px]" : "text-[44px]",
            )}
          >
            <span className="text-primary">Search</span>
            <span className="text-secondary"> + </span>
            <span
              style={{
                background: "linear-gradient(180deg, #7E6AFF 0%, #AA9DFF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Atom
            </span>
          </h1>
        </div>
        <SearchInput
          value={state.query}
          onSearch={handleSearch}
          className={styles.centeredSearchContainer}
        />
        <p className={styles.poweredByContainer}>
          <span className="text-secondary">
            This is an experimental release built with Gemini and Thesys
          </span>
        </p>
      </div>
    </>
  );
};
