import {
SignedIn,
SignedOut,
} from '@clerk/nextjs'

export default async function chatPage() {

    return (
        <div className='flex flex-col items-center justify-center flex-grow'>
            <SignedIn>
                <h1 className='scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-6'>How can I help you?</h1>
            </SignedIn>
            <SignedOut>
                <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight mb-6'>This a beta site for invited user only,<br/>Please sign in to chat</h1>
            </SignedOut>
        </div>
    );
}