"use client";
import { ChatInputArea } from "~/components/chat-input-area";
import { useState, useEffect } from "react";
import { type Model, MODELS, type SearchMode } from "~/lib/models";
import { generateUUID } from "~/lib/utils";
import { type Message } from "@ai-sdk/react";
import { useRouter } from "next/navigation";

export default function ChatInputAreaWrapper() {
    const [model, setModel] = useState<Model | undefined>(MODELS[0]);
    const [searchMode, setSearchMode] = useState<SearchMode>("off")
    const [input, setInput] = useState("");
    const router = useRouter();

    // Initialize model from localStorage after component mounts
    useEffect(() => {
        const savedModel = localStorage.getItem("last_used_model") as Model;
        if (savedModel) {
            setModel(savedModel);
        }
    }, []);

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
        router.push(`/chat/${sessionId}?new=t`, { scroll: false,  });
    }

  return (
    <div className="w-full flex bottom-0 justify-center max-w-full left-0">
        <ChatInputArea 
            handleSubmit={customHandleSubmit}
            input={input}
            handleInputChange={(e) => setInput(e.target.value)}
            status="ready"
            model={model}
            stop={() => {/* empty */}}
            setModel={setModel}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
        />
    </div>
  );
}
