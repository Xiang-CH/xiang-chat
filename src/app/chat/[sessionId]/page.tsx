import ChatArea  from './_components/chat-area';
import ChatInputAreaWrapper from '../_components/chat-input-area-wrapper';
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache';
import { loadChat } from '~/lib/message-store';

// export const dynamic = "force-dynamic";

export default async function chatSession(props: { params: Promise<{ sessionId: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const { sessionId } = await props.params;
    const searchParams = await props.searchParams;

    let messages;

    if (!searchParams?.new) {
        const getCachedUser = unstable_cache(
            async () => {
              return await loadChat(sessionId);
            },
            [sessionId], // add the user ID to the cache key
            {
              tags: [sessionId],
              revalidate: 3600,
            }
          )
        messages = await getCachedUser();
    }
    
    console.log(messages)

    return (
        <Suspense fallback={<ChatInputAreaWrapper/>}>
            <ChatArea sessionId={sessionId} historyMessages={messages}/>
        </Suspense>
    );
}
