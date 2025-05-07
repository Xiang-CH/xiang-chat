"use client";
import { type Message, useChat } from "@ai-sdk/react";
// import { loadChat } from "~/lib/message-store";
import { ChatInputArea } from "~/components/chat-input-area";
import { useEffect, useRef, useState, useCallback } from "react";
import { type Model, MODELS, type SearchMode } from "~/lib/models";
import { CopyIcon } from "@radix-ui/react-icons";
import { useSidebarRefresh } from "~/context/sidebar-refresh-context";

import { MessageReasoning } from "~/components/message-reasoning";
import { Markdown } from "../../../../components/markdown";
import { useRouter } from "next/navigation";
import { generateUUID } from "~/lib/utils";
import PulseLoader from "react-spinners/PulseLoader";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { type GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { GroundingSourcesPanel } from '~/components/grounding-sources-panel';

type MessageAnnotation = {
  model?: Model;
  sessionTitle?: string;
  searchMode?: SearchMode;
  groundings?: GoogleGenerativeAIProviderMetadata["groundingMetadata"],
  messageId?: string;
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
  const [searchMode, setSearchMode] = useState<SearchMode>("off");
  const [scrolled, setScrolled] = useState(false);
  const [titleUpdated, setTitleUpdated] = useState(false);

  const [isSourcesPanelOpen, setIsSourcesPanelOpen] = useState(false)
  const [currentGroundingDataForPanel, setCurrentGroundingDataForPanel] = useState<GoogleGenerativeAIProviderMetadata["groundingMetadata"] | null>(null);

  const [groundings, setGroundings] = useState<Record<string, GoogleGenerativeAIProviderMetadata["groundingMetadata"]>>(() => {
    if (!historyMessages) return {};
    return historyMessages.reduce((acc: Record<string, GoogleGenerativeAIProviderMetadata["groundingMetadata"]>, m: Message) => {
      const annotation = m.annotations?.[0] as MessageAnnotation | undefined;
      if (annotation?.groundings && m.id) {
        acc[m.id] = annotation.groundings;
      }
      return acc; // Always return the accumulator
    }, {} as Record<string, GoogleGenerativeAIProviderMetadata["groundingMetadata"]>); // Initial value with correct type
  });

  // useEffect(() => {
  //   const savedSearchMode = localStorage.getItem("search_mode") as SearchMode;
  //   if (savedSearchMode) {
  //     setSearchMode(savedSearchMode);
  //   }
  // }, []);

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
    body: {
      modelId: model ?? MODELS[0],
      searchMode: searchMode,
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

    const annotations = messages[messages.length - 1]?.annotations;
    const last_annotation = annotations?.[annotations.length - 1] as MessageAnnotation;
    const messageId = messages[messages.length - 1]?.id

    if (last_annotation?.groundings && messageId) {
      console.log(last_annotation);
      setGroundings({...groundings, [messageId]: last_annotation.groundings});
      console.log(groundings)
    }

    if (last_annotation?.sessionTitle && !titleUpdated) {
      console.log(last_annotation);
      const sessionTitle = last_annotation.sessionTitle;
      console.log("triggered sidebar refresh with title", sessionTitle);
      triggerRefresh(sessionTitle);
      setTitleUpdated(true);

      // Remove "new" search param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, '', url);
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
                  {/* Groundings */}
                  {groundings[m.id]?.groundingChunks && (
                    <Button variant="outline" className="rounded-3xl text-muted-foreground ml-2 my-1" onClick={() => {
                      setCurrentGroundingDataForPanel(groundings[m.id] ?? null);
                      setIsSourcesPanelOpen(true)
                    }}>Source</Button>
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
          searchMode={searchMode}
          setSearchMode={setSearchMode}
        />

      <GroundingSourcesPanel
        isOpen={isSourcesPanelOpen}
        onClose={() => setIsSourcesPanelOpen(false)}
        sources={currentGroundingDataForPanel?.groundingChunks}
        googleSearchRender={currentGroundingDataForPanel?.searchEntryPoint?.renderedContent}
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
