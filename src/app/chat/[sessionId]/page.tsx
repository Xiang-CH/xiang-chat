import { loadChat } from '~/lib/message-store';
import ChatArea  from '~/components/chat-area';
import { redirect } from 'next/dist/server/api-utils';

export default async function chatSession(props: { params: Promise<{ sessionId: string}>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const { sessionId } = await props.params;
    const initialMessages = await loadChat(sessionId)

    if (initialMessages.length == 1) {
        return (
            <ChatArea sessionId={sessionId} initialMessages={[]} initialInput={initialMessages[0]?.content}/>
        );
    }

    return (
        <ChatArea sessionId={sessionId} initialMessages={initialMessages}/>
    );
}