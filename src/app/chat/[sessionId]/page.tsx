import { loadChat } from '~/lib/message-store';
import ChatArea  from '~/components/chat-area';
import { auth } from '@clerk/nextjs/server';
import { RedirectToSignIn } from '@clerk/nextjs';

export default async function chatSession(props: { params: Promise<{ sessionId: string}>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const { userId } = await auth();
    if (!userId) return <RedirectToSignIn />;

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