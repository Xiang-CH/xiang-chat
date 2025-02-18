"use client";
import { type Message, useChat } from "@ai-sdk/react";
import { ChatInputArea } from "~/components/chat-input-area";
import { useEffect, useRef, useState } from "react";
import { type Model, MODELS } from "~/lib/models";

type MessageAnnotation = {
  model: Model;
};
import EmptySession from "~/components/empty-session";
import { createNewSession } from "~/lib/actions";
import { MessageReasoning } from "~/components/message-reasoning";
import { Markdown } from "./markdown";
import { useRouter } from "next/navigation";
import { generateUUID } from "~/lib/utils";
import PulseLoader from "react-spinners/PulseLoader";

export default function ChatArea({
  sessionId,
  initialMessages,
  initialInput,
  initialModel,
}: {
  sessionId?: string | undefined;
  initialMessages?: Message[];
  initialInput?: string | undefined;
  initialModel?: Model | undefined;
} = {}) {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [ userScrolled, setUserScrolled ] = useState(false);
  const [ model, setModel ] = useState<Model>(initialModel ?? MODELS[0]);
  const [ titleRefreshed, setTitleRefreshed ] = useState(false);
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
    await createNewSession(input, model);
  }

  // Update scroll flag based on user's scroll position
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If the distance from the bottom is greater than 10px, consider that the user scrolled up
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setUserScrolled(!isAtBottom);
  };

  useEffect(() => {
    if (initialInput) {
      handleSubmit(new Event("submit"));
    }
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Auto scroll to bottom only if the user hasn't scrolled away
  const scrollToBottom = () => {
    if (!userScrolled && chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (messages.length == 2 && !titleRefreshed) {
      router.refresh();
      setTitleRefreshed(true);
      console.log("refreshed");
    }
    scrollToBottom();
  }, [messages]);

  return (
    // <ScrollArea>
    <div className="flex min-h-[100dvh] h-full w-full flex-col items-center justify-between" ref={chatContainerRef}>
      {!sessionId ? (
        <EmptySession />
      ) : (
        <div className="flex h-full w-full max-w-[50rem] flex-col gap-4 px-4">
          <div className="h-8"></div>
          {messages.map((m, messageIndex) => (
            <div key={m.id} className="h-fit">
              {m.role === "user" ? (
                <div className="w-fit justify-self-end rounded-xl bg-primary px-3 py-2 text-primary-foreground">
                  <Markdown>{m.content}</Markdown>
                </div>
              ) : (
                <div>
                  {m.parts.map((p, index) => {
                    if (p.type === "text") {
                      return (
                        <Markdown key={`${m.id}_${index}`}>{p.text}</Markdown>
                      );
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
                      return null
                    }
                  })}
                  {messageIndex == messages.length - 1 && isLoading && (<PulseLoader color="hsl(var(--foreground))" size={5} />)}
                  <div className={`text-xs h-8 transition-all flex items-center ${ messageIndex == messages.length - 1 && isLoading? "opacity-50": "opacity-0 hover:opacity-50"}`}>Generated by: {m.annotations && (m.annotations[0] as MessageAnnotation).model }</div>
                </div>
              )}
            </div>
          ))}
          <div className="h-10"></div>
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
    // </ScrollArea>
  );
}
