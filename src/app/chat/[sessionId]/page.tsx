import ChatArea  from '~/components/chat-area';
import { auth } from '@clerk/nextjs/server';
import { RedirectToSignIn } from '@clerk/nextjs';
import { Suspense } from 'react'

export default async function chatSession(props: { params: Promise<{ sessionId: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    const { userId } = await auth();
    if (!userId) return <RedirectToSignIn />;

    const { sessionId } = await props.params;

    return (
        <Suspense fallback={<Loading/>}>
            <ChatArea sessionId={sessionId}/>
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