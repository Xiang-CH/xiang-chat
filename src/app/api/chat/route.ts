import {
  createDataStreamResponse,
  smoothStream,
  streamText,
  type Message,
} from "ai";
import { saveMessages } from "~/lib/message-store";
import { createNewSession } from "~/lib/session-store";
import { config } from "dotenv";
import { auth } from "@clerk/nextjs/server";
import { MODEL_DATA, DEFAULT_MODEL, type Model } from "~/lib/models";
import { ProxyAgent, setGlobalDispatcher } from "undici";

config({ path: ".env" });

if (process.env.HTTP_PROXY) {
  const proxyAgent = new ProxyAgent(process.env.HTTP_PROXY);
  setGlobalDispatcher(proxyAgent);
}

export const maxDuration = 60;

export async function POST(req: Request) {

  const { messages, id } = (await req.json()) as {
    messages: Message[];
    id: string;
  };

  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) return new Response("No message", { status: 400 });

  const annotations =
    (lastMessage?.annotations as { model: string; sessionId: string }[]) || [];

  const modelId =
    (annotations[0]?.model as Model) ?? (DEFAULT_MODEL as Model);
    
  const model = MODEL_DATA[modelId].model;

  const lastMessageFormatted = {
    messageId: lastMessage?.id ?? "",
    sessionId: id,
    content: lastMessage?.content ?? "",
    contentReasoning: null,
    role: lastMessage?.role ?? "user",
    model: modelId,
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeMessageAnnotation({ model: modelId });
      const result = streamText({
        model: model,
        messages: messages,
        temperature: 0.8,
        experimental_transform: smoothStream({ 
          chunking: "line",
          delayInMs: 20,
        }),
        // async onError(err) {
        //   console.log("err", err);
        // },
        async onFinish({ text, reasoning}) {
          const assistantMessage = {
            messageId: crypto.randomUUID(),
            sessionId: id,
            content: text,
            contentReasoning: reasoning ?? null,
            role: "assistant" as "data" | "system" | "user" | "assistant",
            model: modelId,
            createdAt: undefined,
          };

          console.log("route", assistantMessage)

          if (messages.length == 1) {
            await createNewSession(userId, [lastMessageFormatted, assistantMessage], id);
          } else {
            await saveMessages([lastMessageFormatted, assistantMessage]);
          }
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
        sendUsage: true,
      });
    },
    onError: (error) => {
      return "Error: " + JSON.stringify(error);
    },

  });
}
