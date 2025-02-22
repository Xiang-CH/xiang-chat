import {
  createDataStreamResponse,
  smoothStream,
  streamText,
  type Message,
} from "ai";
import { saveMessage } from "~/lib/message-store";
import { updateSessionTitle } from "~/lib/session-store";
import { config } from "dotenv";
import { auth } from "@clerk/nextjs/server";
import { myProvider, DEFAULT_MODEL, Model } from "~/lib/models";

config({ path: ".env" });

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, id } = (await req.json()) as {
    messages: Message[];
    id: string;
  };

  const { userId } = await auth();
  if (!userId) return;

  const lastMessage = messages[messages.length - 1];
  const annotations =
    (lastMessage?.annotations as { model: string; sessionId: string }[]) || [];
  // console.log(annotations)

  const modelName =
    (annotations[0]?.model as Model) ?? (DEFAULT_MODEL as Model);
  const model = myProvider.languageModel(modelName);

  if (messages.length > 1) {
    await saveMessage({
      messageId: lastMessage?.id ?? "",
      sessionId: id,
      content: lastMessage?.content ?? "",
      contentReasoning: null,
      role: lastMessage?.role ?? "user",
      model: modelName,
    });
  } else {
    await updateSessionTitle(id, lastMessage?.content ?? "New Chat");
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeMessageAnnotation({ model: modelName });
      const result = streamText({
        model: model,
        messages: messages,
        temperature: 0.8,
        experimental_transform: smoothStream({ chunking: "word" }),
        async onError(err) {
          console.log("err", err);
        },
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
