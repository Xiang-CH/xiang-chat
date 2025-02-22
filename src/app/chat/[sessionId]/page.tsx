import { loadChat } from '~/lib/message-store';
import ChatArea  from '~/components/chat-area';
import { auth } from '@clerk/nextjs/server';
import { RedirectToSignIn } from '@clerk/nextjs';
import { Model } from '~/lib/models';
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default async function chatSession(props: { params: Promise<{ sessionId: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const { userId } = await auth();
    if (!userId) return <RedirectToSignIn />;

    const { sessionId } = await props.params;
    let initialMessages = []

    try {
        initialMessages = await loadChat(sessionId)
    } catch (error) {
        console.error(error)
        redirect('/chat')
    }

    if (!initialMessages) {
        redirect('/chat')
    }

    const annotations = initialMessages[initialMessages.length - 1]?.annotations as { model: Model, sessionId: string }[] || []
    // console.log(annotations)

    if (initialMessages.length == 1) {
        return (
            <ChatArea sessionId={sessionId} initialMessages={[]} initialInput={initialMessages[0]?.content} initialModel={annotations[0]?.model}/>
        );
    }

    return (
        <Suspense fallback={<Loading/>}>
            <ChatArea sessionId={sessionId} initialMessages={initialMessages} initialModel={annotations[0]?.model}/>
        </Suspense>
    );
}

function Loading() {
    return (
        <div className="flex items-center justify-center h-[100dvh] w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    )
}