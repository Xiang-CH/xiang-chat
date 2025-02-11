"use client"
import { type Message, useChat } from "@ai-sdk/react";
import { ChatInputArea } from "~/components/chat-input-area";
import { useEffect, useState } from "react";
import { type Model, MODELS } from "~/lib/models";
import EmptySession from "~/components/empty-session";
import { createNewSession } from "~/lib/actions";

export default function ChatArea({
  sessionId,
  initialMessages,
  initialInput,
}: {
  sessionId?: string | undefined;
  initialMessages?: Message[];
  initialInput?: string | undefined;
} = {}) {
  const [ model, setModel ] = useState<Model>(MODELS[0]);
  const { input, handleInputChange, handleSubmit, messages, isLoading, stop } =
    useChat({
      id: sessionId, // use the provided chat ID
      initialMessages, // initial messages if provided
      initialInput, // initial input if provided
      sendExtraMessageFields: true, // send id and createdAt for each message
      generateId: (() => {
        return crypto.randomUUID()
      }),
      experimental_prepareRequestBody: ({ messages, id }) => {
        // Eslint: Ignore
        const lastMessage = messages[messages.length - 1]

        if (!lastMessage) return []

        if (lastMessage.annotations){
          lastMessage.annotations.push({model: model});
        } else {
          lastMessage.annotations = [{model: model}]
        }
        
        return {id:id, messages:messages} as {id: string, messages: Message[]};
      },
    });

  async function customHandleSubmit () {
    if (!input) return;
    await createNewSession(input)
  }

  useEffect(() => {
    if (initialInput) {
      handleSubmit(new Event('submit'))
    }
  }, [])


  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      {!sessionId ? (
        <EmptySession />
      ) : (
        <div className="w-full max-w-[50rem]">
          {messages.map((m) => (
            <div key={m.id}>
              {m.role === "user" ? "User: " : "AI: "}
              {m.content}
              {m.role === "assistant" && <><br/><br/></>}
            </div>
          ))}
        </div>
      )}

      <ChatInputArea
        handleSubmit={sessionId? handleSubmit : customHandleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        stop={stop}
        model={model}
        setModel={setModel}
      />
    </div>
  );
}
