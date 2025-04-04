"use client";
import { type Message, useChat } from "@ai-sdk/react";
// import { loadChat } from "~/lib/message-store";
import { ChatInputArea } from "~/components/chat-input-area";
import { useEffect, useRef, useState, useCallback } from "react";
import { type Model, MODELS } from "~/lib/models";
import { CopyIcon } from "@radix-ui/react-icons";
import { useSidebarRefresh } from "~/context/sidebar-refresh-context";

import { MessageReasoning } from "~/components/message-reasoning";
import { Markdown } from "../../../../components/markdown";
import { useRouter } from "next/navigation";
import { generateUUID } from "~/lib/utils";
import PulseLoader from "react-spinners/PulseLoader";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";

type MessageAnnotation = {
  model?: Model;
  sessionTitle?: string;
};

export default function ChatArea({
  sessionId,
  historyMessages,
}: {
  sessionId?: string | undefined;
  historyMessages?: Message[];
} = {}) {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [model, setModel] = useState<Model | undefined>((historyMessages?.[0]?.annotations?.[0] as MessageAnnotation)?.model ?? undefined);
  const [scrolled, setScrolled] = useState(false);
  const [titleUpdated, setTitleUpdated] = useState(false);

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    // setMessages,
    status,
    stop,
    append,
  } = useChat({
    id: sessionId, // use the provided chat ID
    sendExtraMessageFields: true, // send id and createdAt for each message
    initialMessages: historyMessages,
    generateId: () => {
      return generateUUID();
    },
    onError(error) {
      if (error instanceof Error) {
        return toast.error(error.message);
      }
    },
    experimental_prepareRequestBody: ({ messages, id }) => {
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage) return [];

      if (lastMessage.annotations) {
        if (lastMessage.annotations.length == 0) {
          lastMessage.annotations.push({ model: model ?? MODELS[0] });
        }
      } else {
        lastMessage.annotations = [{ model: model ?? MODELS[0] }];
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

    setUserSubmitted(true);
    setScrolled(false);
    handleSubmit();
  }

  useEffect(() => {
    if (!sessionId) {
      router.push("/chat");
      return;
    }
    
    scrollToBottom();
    if (historyMessages) return

    const initialMessage = localStorage.getItem(`newMessage_${sessionId}`);

    if (initialMessage) {
      void (async () => {
        const parsedMessage = JSON.parse(initialMessage) as Message;
        setModel((parsedMessage.annotations?.[0] as MessageAnnotation)?.model);
        scrollToBottom();

        await append(parsedMessage);
        localStorage.removeItem(`newMessage_${sessionId}`);
      })();
      return;
    } else {

      // try {
      //   void (async () => {
      //     const initialMessages = await loadChat(sessionId);
      //     if (!initialMessages || initialMessages.length == 0) {
      //       router.push("/chat");
      //       return;
      //     }

      //     setModel(
      //       (
      //         initialMessages[initialMessages.length - 1]
      //           ?.annotations as MessageAnnotation[]
      //       )?.[0]?.model ?? MODELS[0],
      //     );

      //     if (initialMessages[initialMessages.length - 1]?.role === "user") {
      //       const lastMessage = initialMessages[initialMessages.length - 1];
      //       setMessages(initialMessages.slice(0, -1));
      //       if (lastMessage) {
      //         await append(lastMessage);
      //       }
      //     } else {
      //       console.log(initialMessages);
      //       setMessages(initialMessages);
      //     }

      //     setTimeout(() => {
      //       scrollToBottom();
      //     }, 0);
      //   })();
      // } catch (error) {
      //   console.error(error);
      //   router.push("/chat");
      //   return;
      // }
    }
  }, []);

  // Auto scroll to bottom only if the user hasn't scrolled away
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    }
  }, [chatContainerRef]);

  const { triggerRefresh } = useSidebarRefresh();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if ((messages[messages.length - 1]?.annotations?.[1] as MessageAnnotation)?.sessionTitle && !titleUpdated) {
      const sessionTitle = (messages[messages.length - 1]?.annotations?.[1] as MessageAnnotation)?.sessionTitle;
      console.log("triggered sidebar refresh with title", sessionTitle);
      triggerRefresh(sessionTitle);
      setTitleUpdated(true);
    } 

    if (messages.length == 2 && status == "ready") {
      // Trigger sidebar refresh instead of page navigation
      triggerRefresh();
      console.log("triggered sidebar refresh");
    }

    if (messages.length > 0 && userSubmitted) {
      timeoutId = setTimeout(() => {
        // Your scrolling logic here
        const elements = chatContainerRef.current?.children;

        const reverseIndex =
          messages[messages.length - 1]?.role == "assistant" ? 3 : 2;
        if (elements && elements.length >= reverseIndex && !scrolled) {
          const secondToLastElement = elements[
            elements.length - reverseIndex
          ] as HTMLElement;
          secondToLastElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          if (reverseIndex == 3) setScrolled(true);
        }
      }, 50); // Increased debounce time
    }

    return () => clearTimeout(timeoutId);
  }, [messages, status, userSubmitted, scrolled]);

  return (
    <div className="flex w-full flex-col items-center justify-between relative">
      {messages.length == 0 ? (
        <Loading />
      ) : (
        <div
          className="flex h-full w-full max-w-[50rem] flex-col gap-4 px-1 md:px-3 transition-opacity duration-100 ease-in-out"
          ref={chatContainerRef}
        >
          <div className="h-8"></div>
          {messages.map((m, messageIndex) => (
            <div
              key={m.id}
              className={
                messageIndex == messages.length - 1 && userSubmitted
                  ? "min-h-[calc(100dvh-19.5rem)]"
                  : ""
              }
            >
              {m.role === "user" ? (
                <div className={"flex w-full justify-end"}>
                  <div className="my-3 ml-6 w-fit rounded-xl bg-primary px-4 text-primary-foreground md:ml-14">
                    <Markdown className="!leading-relaxed whitespace-pre-wrap">{m.content}</Markdown>
                  </div>
                </div>
              ) : (
                <div className="px-1 w-full">
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
                              ? status === "submitted" || status === "streaming"
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
                  {messageIndex == messages.length - 1 && (status === "submitted" || status === "streaming") && m.parts.length == 0 && (
                    <PulseLoader color="hsl(var(--foreground))" size={5} />
                  )}

                  {/* Generated by + Copy Button */}
                  <div
                    className={`flex h-8 items-center gap-2 text-xs transition-all ${messageIndex == messages.length - 1 ? "opacity-50" : "opacity-0 hover:opacity-50"}`}
                  >
                    {(status === "ready" || messageIndex != messages.length - 1) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={async () => {
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
                    )}
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
          <div className="h-48"></div>
        </div>
      )}

        <ChatInputArea
          handleSubmit={customHandleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          status={status}
          stop={stop}
          model={model}
          setModel={setModel}
        />
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
    </div>
  );
}
