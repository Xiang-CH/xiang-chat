"use client";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "~/components/ui/chat-input";
import { ModelSelector} from "~/components/ui/model-selector";
import { MODELS, type Model } from "~/lib/models";
import { useState } from "react";
import { toast } from "sonner";

function ChatInputArea({ className }: { className?: string }) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<Model>(MODELS[0]);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast(value);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`${className} flex w-full max-w-[50rem]`}>
      <div className="h-full w-full">
        <ChatInput
          variant="default"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onSubmit={handleSubmit}
          loading={isLoading}
          onStop={() => setIsLoading(false)}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <div className="flex w-full items-center justify-between">
            <div>
                <ModelSelector value={model} onChange={setModel}/>
            </div>
            <ChatInputSubmit />
          </div>
        </ChatInput>
      </div>
    </div>
  );
}

export { ChatInputArea };
