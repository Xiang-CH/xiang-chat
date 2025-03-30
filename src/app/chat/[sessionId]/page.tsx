import ChatArea  from './_components/chat-area';
import ChatInputAreaWrapper from '../_components/chat-input-area-wrapper';
import { auth } from '@clerk/nextjs/server';
import { RedirectToSignIn } from '@clerk/nextjs';
import { Suspense } from 'react'

export default async function chatSession(props: { params: Promise<{ sessionId: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const { userId } = await auth();
    if (!userId) return <RedirectToSignIn />;

    const { sessionId } = await props.params;

    return (
        <Suspense fallback={<ChatInputAreaWrapper/>}>
            <ChatArea sessionId={sessionId}/>
        </Suspense>
    );
}
