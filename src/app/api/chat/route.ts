import {
  createDataStreamResponse,
  smoothStream,
  streamText,
  type Message,
} from "ai";
import { saveMessage } from "~/lib/message-store";
import { createNewSession } from "~/lib/session-store";
import { config } from "dotenv";
import { auth } from "@clerk/nextjs/server";
import { myProvider, DEFAULT_MODEL, type Model } from "~/lib/models";

config({ path: ".env" });

export const maxDuration = 60;

export async function POST(req: Request) {

  const { messages, id } = (await req.json()) as {
    messages: Message[];
    id: string;
  };

  console.log("messages_id", id);

  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) return new Response("No message", { status: 400 });

  const annotations =
    (lastMessage?.annotations as { model: string; sessionId: string }[]) || [];

  const modelName =
    (annotations[0]?.model as Model) ?? (DEFAULT_MODEL as Model);
  console.log(modelName)
  const model = myProvider.languageModel(modelName);

  const lastMessageFormatted = {
    messageId: lastMessage?.id ?? "",
    sessionId: id,
    content: lastMessage?.content ?? "",
    contentReasoning: null,
    role: lastMessage?.role ?? "user",
    model: modelName,
  }

  if (messages.length == 1) {
    await createNewSession(userId, lastMessageFormatted, id);
  } else {
    await saveMessage(lastMessageFormatted);
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeMessageAnnotation({ model: modelName });
      const result = streamText({
        model: model,
        messages: messages,
        temperature: 0.8,
        experimental_transform: smoothStream({ chunking: "word" }),
        // async onError(err) {
        //   console.log("err", err);
        // },
        async onFinish({ text, reasoning }) {
          const assistantMessage = {
            messageId: crypto.randomUUID(),
            sessionId: id,
            content: text,
            contentReasoning: reasoning ?? null,
            role: "assistant" as "data" | "system" | "user" | "assistant",
            model: modelName,
            createdAt: undefined,
          };
          await saveMessage(assistantMessage);
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

  // const result = streamText({
  //   model: myProvider.languageModel("aliyun/deepseek-r1-llama-70b"),
  //   messages: messages,
  //   temperature: 0.8,
  //   async onFinish({ text, reasoning }) {
  //     console.log("reasoning", reasoning)
  //     const assistantMessage = {
  //       messageId: crypto.randomUUID(),
  //       sessionId: id,
  //       content: text,
  //       contentReasoning: reasoning ?? null,
  //       role: 'assistant' as "data" | "system" | "user" | "assistant",
  //       model: model,
  //       createdAt: undefined
  //     }
  //     await saveMessage(assistantMessage)
  //   },
  // });

  // return result.toDataStreamResponse({sendReasoning: true, sendUsage: true});
}
