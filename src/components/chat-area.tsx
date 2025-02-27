"use client";
import { type Message, useChat } from "@ai-sdk/react";
import { loadChat } from '~/lib/actions';
import { ChatInputArea } from "~/components/chat-input-area";
import { useEffect, useRef, useState } from "react";
import { type Model, MODELS } from "~/lib/models";
import { CopyIcon } from "@radix-ui/react-icons";

type MessageAnnotation = {
  model: Model;
};
import EmptySession from "~/components/empty-session";
import { createNewSession } from "~/lib/actions";
import { MessageReasoning } from "~/components/message-reasoning";
import { Markdown } from "./markdown";
import { useRouter, usePathname } from "next/navigation";
import { generateUUID } from "~/lib/utils";
import PulseLoader from "react-spinners/PulseLoader";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function ChatArea({
  sessionId,
}: {
  sessionId?: string | undefined;
} = {}) {
  const router = useRouter();
  const currentRoute = usePathname()
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [model, setModel] = useState<Model | undefined>(sessionId? undefined : MODELS[0]);
  const [titleRefreshed, setTitleRefreshed] = useState(false);
  const { input, handleInputChange, handleSubmit, messages, setMessages, isLoading, stop, append } =
    useChat({
      id: sessionId, // use the provided chat ID
      sendExtraMessageFields: true, // send id and createdAt for each message
      generateId: () => {
        return generateUUID();
      },
      onError(error) {
        return toast.error(error.message);
      },
      experimental_prepareRequestBody: ({ messages, id }) => {
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage) return [];

        if (lastMessage.annotations) {
          lastMessage.annotations.push({ model: model ?? MODELS[0] });
        } else {
          lastMessage.annotations = [{ model: model ?? MODELS[0]}];
        }

        return { id: id, messages: messages } as {
          id: string;
          messages: Message[];
        };
      },
    });

  async function customHandleSubmit() {
    if (!model) return;
    if (!input) return;
    if (!sessionId) {
      sessionId = await createNewSession(input, model);
      router.push(`/chat/${sessionId}`);
      return;
    }
    setUserScrolled(false);
    setUserSubmitted(true);
    handleSubmit();
  }

  useEffect(() => {
    if (currentRoute == "/chat") {
      return;
    }

    if (!sessionId) {
      router.push('/chat')
      return;
    }

    try {
        void (async () => {
          const initialMessages = await loadChat(sessionId);
            if (!initialMessages || initialMessages.length == 0) {
              router.push('/chat')
              return;
            }

            if (initialMessages[initialMessages.length - 1]?.role === "user") {
              const lastMessage = initialMessages[initialMessages.length - 1];
              setMessages(initialMessages.slice(0, -1));
              if (lastMessage) {
                await append(lastMessage);
              }
            } else {
              setMessages(initialMessages);
            }

            setModel(
              (initialMessages[initialMessages.length - 1]
                ?.annotations as MessageAnnotation[])?.[0]?.model ?? MODELS[0],
            );

            scrollToBottom();
        })();
    } catch (error) {
        console.error(error);
        router.push('/chat')
        return;
    }
  }, []);

  // Auto scroll to bottom only if the user hasn't scrolled away
  const scrollToBottom = () => {
    if (!userScrolled && chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    }
  };

  useEffect(() => {
    if (messages.length == 2 && !titleRefreshed) {
      router.refresh();
      setTitleRefreshed(true);
      console.log("refreshed");
    }

    setTimeout(() => {
      if (userSubmitted && messages.length > 0 && !userScrolled) {
        const elements = chatContainerRef.current?.children;
        console.log(elements);

        const reverseIndex =
          messages[messages.length - 1]?.role == "assistant" ? 3 : 2;
        if (elements && elements.length >= reverseIndex) {
          const secondToLastElement = elements[
            elements.length - reverseIndex
          ] as HTMLElement;
          secondToLastElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          if (reverseIndex == 3) setUserScrolled(true);
        }
      }
    }, 100);
  }, [messages]);

  return (
    // <ScrollArea>
    <div className="flex h-full min-h-[100dvh] w-full flex-col items-center justify-between">
      {!sessionId ? (
        <EmptySession />
      ) : (
        <div
          className="flex h-full w-full max-w-[50rem] flex-col gap-4 px-4"
          ref={chatContainerRef}
        >
          <div className="h-8"></div>
          {messages.map((m, messageIndex) => (
            <div
              key={m.id}
              className={
                messageIndex == messages.length - 1 && userSubmitted
                  ? "min-h-[80dvh]"
                  : ""
              }
            >
              {m.role === "user" ? (
                <div className={"flex w-full justify-end"}>
                  <div className="my-3 ml-6 w-fit rounded-xl bg-primary px-3 py-2 text-primary-foreground md:ml-14">
                    <Markdown>{m.content}</Markdown>
                  </div>
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
                      return null;
                    }
                  })}

                  {/* LoadingAnimation */}
                  {messageIndex == messages.length - 1 && isLoading && (
                    <PulseLoader color="hsl(var(--foreground))" size={5} />
                  )}

                  {/* Generated by + Copy Button */}
                  <div
                    className={`flex h-8 gap-2 items-center text-xs transition-all ${messageIndex == messages.length - 1 ? "opacity-50" : "opacity-0 hover:opacity-50"}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={async() => {
                        const text = m.parts
                          .filter((p) => p.type === "text")
                          .map((p) => p.text)
                          .join("\n");
                        await navigator.clipboard.writeText(text);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <span>
                      Generated by:{" "}
                      {m.annotations &&
                        (m.annotations[0] as MessageAnnotation).model}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex_col item-end flex h-48 justify-end"></div>
        </div>
      )}

      <ChatInputArea
        handleSubmit={customHandleSubmit}
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
