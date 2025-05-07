"use client";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "~/components/ui/chat-input";
import { ModelSelector } from "~/components/ui/model-selector";
import { SearchModeToggle } from "~/components/ui/search-mode-toggle";
import { type Model, type SearchMode, MODEL_DATA } from "~/lib/models";
import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

function ChatInputArea({
  className,
  handleSubmit,
  input,
  handleInputChange,
  status,
  stop,
  model,
  setModel,
  searchMode,
  setSearchMode,
}: {
  className?: string;
  handleSubmit: () => void;
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  status: 'ready' | 'streaming' | 'submitted' | 'error';
  stop: () => void;
  model: Model | undefined;
  setModel: (model: Model) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void
}) {
  const { isSignedIn } = useAuth();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (installed PWA)
    const isInStandaloneMode = (): boolean => {
      const mediaMatch = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      // Properly type the navigator for iOS standalone mode
      const nav = window.navigator as Navigator & {
        standalone?: boolean;
      };
      const isIOSStandalone = nav.standalone === true;
      const isAndroidStandalone = document.referrer.includes("android-app://");

      return mediaMatch || isIOSStandalone || isAndroidStandalone;
    };

    setIsStandalone(isInStandaloneMode());

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const showSearchToggle = model && MODEL_DATA[model].isSearch;

  return (
    <div className="fixed left-0 md:left-auto bottom-0 flex w-full max-w-[50rem] justify-center rounded-t-2xl bg-muted md:bg-background">
      <div
        className={`${className} flex w-full max-w-[50rem] md:mb-2 md:w-[98%]`}
      >
        <div className="h-full w-full">
          <ChatInput
            variant="default"
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={status === 'submitted' || status === 'streaming'}
            onStop={() => stop()}
            className="rounded-b-none bg-muted focus-within:ring-0 md:rounded-b-2xl"
          >
            <ChatInputTextArea
              placeholder="Type a message..."
              disabled={!isSignedIn}
            />
            <div className="flex w-full items-end justify-between">
              <div className="flex items-center gap-2 justify-start">
                <div tabIndex={-1}>
                  <ModelSelector
                    value={model}
                    onChange={(value) => {
                      localStorage.setItem("last_used_model", value)
                      setModel(value)
                    }}
                    disabled={!isSignedIn}
                  />
                </div>
                {showSearchToggle && (
                  <div tabIndex={-1}>
                    <SearchModeToggle
                      value={searchMode}
                      onChange={(value) => {
                        localStorage.setItem("search_mode", value);
                        setSearchMode(value);
                      }}
                      disabled={!isSignedIn}
                    />
                  </div>
                )}
              </div>
              <ChatInputSubmit/>
            </div>
            {isStandalone && <div className="pb-10"></div>}
          </ChatInput>
        </div>
      </div>
    </div>
  );
}

export { ChatInputArea };
