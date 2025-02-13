"use client";
import { type Message, useChat } from "@ai-sdk/react";
import { ChatInputArea } from "~/components/chat-input-area";
import { useEffect, useState } from "react";
import { type Model, MODELS } from "~/lib/models";
import EmptySession from "~/components/empty-session";
import { createNewSession } from "~/lib/actions";
import { MessageReasoning } from "~/components/message-reasoning";
import { Markdown } from "./markdown";
import { useRouter } from 'next/navigation'
import { generateUUID } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area"

export default function

  ChatArea({
    sessionId,
    initialMessages,
    initialInput,
  }: {
    sessionId?: string | undefined;
    initialMessages?: Message[];
    initialInput?: string | undefined;
  } = {}) {
  const router = useRouter()
  const [model, setModel] = useState<Model>(MODELS[0]);
  const [titleRefreshed, setTitleRefreshed] = useState(false);
  const { input, handleInputChange, handleSubmit, messages, isLoading, stop } =
    useChat({
      id: sessionId, // use the provided chat ID
      initialMessages, // initial messages if provided
      initialInput, // initial input if provided
      sendExtraMessageFields: true, // send id and createdAt for each message
      generateId: () => {
        return generateUUID();
      },
      experimental_prepareRequestBody: ({ messages, id }) => {
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) return [];

        if (lastMessage.annotations) {
          lastMessage.annotations.push({ model: model });
        } else {
          lastMessage.annotations = [{ model: model }];
        }

        return { id: id, messages: messages } as {
          id: string;
          messages: Message[];
        };
      },
    });

  async function customHandleSubmit() {
    if (!input) return;
    await createNewSession(input);
  }

  useEffect(() => {
    if (initialInput) {
      handleSubmit(new Event("submit"));
    }
  }, []);

  useEffect(() => {
    if (messages.length == 2 && !titleRefreshed) {
      setTitleRefreshed(true);
      router.refresh()
      console.log("refreshed")
    }
  }, [messages]);

  return (
    <div className="flex max-h-full w-full flex-col items-center justify-between">
      {!sessionId ? (
        <EmptySession />
      ) : (
          <div className="w-full h-full max-w-[50rem] px-4 flex flex-col gap-4">
            {messages.map((m, messageIndex) => (
              <div key={m.id} className="h-fit">
                {m.role === "user" ? (
                  <div
                    className="rounded-xl bg-primary px-3 py-2 text-primary-foreground w-fit justify-self-end"
                  >
                    <Markdown>{m.content}</Markdown>
                  </div>
                ) : (
                  <div>
                    {m.parts.map((p, index) => {
                      if (p.type === "text") {
                        return <Markdown key={`${m.id}_${index}`}>{p.text}</Markdown>;
                      } else if (p.type === "reasoning") {
                        return (
                          <MessageReasoning
                            key={`${m.id}_${index}`}
                            isLoading={
                              messageIndex == messages.length - 1
                                ? isLoading
                                : false
                            }
                            reasoning={p.reasoning}
                          />
                        );
                      } else {
                        return null;
                      }
                    })}
                  </div>
                )}
              </div>
            ))}
            <div className="h-6"></div>
          </div>

      )}

      <ChatInputArea
        handleSubmit={sessionId ? handleSubmit : customHandleSubmit}
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
