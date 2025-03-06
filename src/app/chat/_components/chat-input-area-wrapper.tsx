"use client";
import { ChatInputArea } from "~/components/chat-input-area";
import { useState } from "react";
import { type Model, MODELS } from "~/lib/models";
import { generateUUID } from "~/lib/utils";
import { type Message } from "@ai-sdk/react";
import { useRouter } from "next/navigation";

export default function ChatInputAreaWrapper() {
    const [model, setModel] = useState<Model | undefined>(MODELS[0]);
    const [input, setInput] = useState("");
    const router = useRouter();

    async function customHandleSubmit() {
        if (!model) return;
        if (!input) return;
    
        const sessionId = generateUUID();
          const tempMsg = {
            id: generateUUID(),
            role: "user",
            content: input,
            annotations: [{ model: model }],
          } as Message;
          localStorage.setItem(`newMessage_${sessionId}`, JSON.stringify(tempMsg));
          router.push(`/chat/${sessionId}`, { scroll: false });
      }

  return (
    <div className="w-full flex justify-center">
        <ChatInputArea 
            handleSubmit={customHandleSubmit}
            input={input}
            handleInputChange={(e) => setInput(e.target.value)}
            isLoading={false}
            stop={stop}
            model={model}
            setModel={setModel}
        />
    </div>
  );
}