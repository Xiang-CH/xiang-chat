import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type Message } from 'ai';
import { saveMessage } from '~/lib/message-store';
import { config } from "dotenv";

config({ path: ".env" }); 

export async function POST(req: Request) {
  const { messages, id } = (await req.json()) as {messages: Message[], id: string};

  const zhipu = createOpenAI({
    baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    apiKey: process.env.ZHIPU_API_KEY,
  });

  console.log(messages)
  const lastMessage = messages[messages.length - 1]
  const annotations = lastMessage?.annotations as { model: string, sessionId: string }[] || []
  console.log(annotations)

  if (messages.length > 1){await saveMessage({
    messageId: lastMessage?.id ?? "",
    sessionId: id,
    content: lastMessage?.content ?? "",
    contentReasoning: null,
    role: lastMessage?.role ?? "user",
    model: 'zhipu/glm-4-flash',
  })}

  const result = streamText({
    model: zhipu('glm-4-flash'),
    messages: messages,
    async onFinish({ text, reasoning }) {
      const assistantMessage = {
        messageId: crypto.randomUUID(),
        sessionId: id,
        content: text,
        contentReasoning: reasoning ?? null,
        role: 'assistant' as "data" | "system" | "user" | "assistant",
        model: 'zhipu/glm-4-flash',
        createdAt: undefined
      }
      await saveMessage(assistantMessage)
    },
  });

  return result.toDataStreamResponse();
}