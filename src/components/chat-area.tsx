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
import { toast } from "sonner";
import { set } from "zod";

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
  const [ userSubmitted, setUserSubmitted ] = useState(false);
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
      onError(error) {
          return toast.error(error.message);
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
    if (!sessionId){
      await createNewSession(input, model);
      return;
    }
    setUserScrolled(false);
    setUserSubmitted(true);
    handleSubmit()
  }


  useEffect(() => {
    if (initialInput) {
      handleSubmit(new Event("submit"));
    }
    scrollToBottom();
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
        console.log(elements)
  
        const reverseIndex = messages[messages.length - 1]?.role == "assistant"? 3: 2;
        if (elements && elements.length >= reverseIndex) {
          const secondToLastElement = elements[elements.length - reverseIndex] as HTMLElement;
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
    <div className="flex min-h-[100dvh] h-full w-full flex-col items-center justify-between">
      {!sessionId ? (
        <EmptySession />
      ) : (
        <div className="flex h-full w-full max-w-[50rem] flex-col gap-4 px-4" ref={chatContainerRef}>
          <div className="h-8"></div>
          {messages.map((m, messageIndex) => (
            <div key={m.id} className={messageIndex == messages.length - 1 && userSubmitted? " min-h-[80dvh]": ""}>
              {m.role === "user" ? (
                <div className={"flex w-full justify-end"}>
                  <div className="ml-6 md:ml-14 w-fit rounded-xl bg-primary px-3 py-2 text-primary-foreground my-3">
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
                      return null
                    }
                  })}
                  {messageIndex == messages.length - 1 && isLoading && (<PulseLoader color="hsl(var(--foreground))" size={5} />)}
                  <div className={`text-xs h-8 transition-all flex items-center ${ messageIndex == messages.length - 1 && isLoading? "opacity-50": "opacity-0 hover:opacity-50"}`}>Generated by: {m.annotations && (m.annotations[0] as MessageAnnotation).model }</div>
                </div>
              )}
            </div>
          ))}
          <div className="h-48 flex flex_col justify-end item-end"></div>
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
