import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText, createDataStreamResponse,smoothStream, type Message } from 'ai';
import { saveMessage } from '~/lib/message-store';
import { updateSessionTitle } from '~/lib/session-store';
import { config } from "dotenv";
import { auth } from "@clerk/nextjs/server";

config({ path: ".env" }); 

const zhipu = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  apiKey: process.env.ZHIPU_API_KEY,
});

const baidu = createDeepSeek({
  baseURL: "https://qianfan.baidubce.com/v2/",
  apiKey: process.env.BAIDU_API_KEY,
});

const MODEL = "deepseek-r1"

export async function POST(req: Request) {
  const { messages, id } = (await req.json()) as {messages: Message[], id: string};

  const { userId } = await auth();
  if (!userId) return

  const lastMessage = messages[messages.length - 1]
  const annotations = lastMessage?.annotations as { model: string, sessionId: string }[] || []
  console.log(annotations)

  if (messages.length > 1){await saveMessage({
    messageId: lastMessage?.id ?? "",
    sessionId: id,
    content: lastMessage?.content ?? "",
    contentReasoning: null,
    role: lastMessage?.role ?? "user",
    model: MODEL,
  })} else {
    await updateSessionTitle(id, lastMessage?.content ?? "")
  }

  // return createDataStreamResponse({
  //   execute: (dataStream) => {
  //     const result = streamText({
  //       model: baidu(MODEL),
  //       messages: messages,
  //       temperature: 0.8,
  //       experimental_transform: smoothStream({ chunking: 'word' }),
  //       async onFinish({ text, reasoning }) {
  //         const assistantMessage = {
  //           messageId: crypto.randomUUID(),
  //           sessionId: id,
  //           content: text,
  //           contentReasoning: reasoning ?? null,
  //           role: 'assistant' as "data" | "system" | "user" | "assistant",
  //           model: MODEL,
  //           createdAt: undefined
  //         }
  //         await saveMessage(assistantMessage)
  //       }, 
  //     });

  //     result.mergeIntoDataStream(dataStream, {
  //       sendReasoning: true,
  //     });
  //   },
  //   onError: () => {
  //     return 'Oops, an error occured!';
  //   },
  // })

  const result = streamText({
    model: baidu(MODEL),
    messages: messages,
    temperature: 0.8,
    async onFinish({ text, reasoning }) {
      console.log("reasoning", reasoning)
      const assistantMessage = {
        messageId: crypto.randomUUID(),
        sessionId: id,
        content: text,
        contentReasoning: reasoning ?? null,
        role: 'assistant' as "data" | "system" | "user" | "assistant",
        model: MODEL,
        createdAt: undefined
      }
      await saveMessage(assistantMessage)
    },
  });

  return result.toDataStreamResponse({sendReasoning: true});
}