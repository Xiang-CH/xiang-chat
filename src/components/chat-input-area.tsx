"use client";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "~/components/ui/chat-input";
import { ModelSelector } from "~/components/ui/model-selector";
import { type Model } from "~/lib/models";
import React from "react";
import { useAuth } from "@clerk/clerk-react";

function ChatInputArea({
  className,
  handleSubmit,
  input,
  handleInputChange,
  isLoading,
  stop,
  model,
  setModel,
}: {
  className?: string;
  handleSubmit: () => void;
  input: string;
  handleInputChange: (e: (React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>)) => void;
  isLoading: boolean;
  stop: () => void;
  model: Model;
  setModel: (model: Model) => void;
}) {

  const { isSignedIn } = useAuth();

  return (
    <div className={`${className} flex w-full max-w-[50rem] mb-2`}>
      <div className="h-full w-full">
        <ChatInput
          variant="default"
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          loading={isLoading}
          onStop={() => stop()}
          className="focus-within:ring-0"
        >
          <ChatInputTextArea
            placeholder="Type a message..."
            disabled={!isSignedIn}
          />
          <div className="flex w-full items-center justify-between">
            <div>
              <ModelSelector
                value={model}
                onChange={setModel}
                disabled={!isSignedIn}
              />
            </div>
            <ChatInputSubmit />
          </div>
        </ChatInput>
      </div>
    </div>
  );
}

export { ChatInputArea };
