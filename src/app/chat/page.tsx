import EmptySession from './_components/empty-session';
import ChatInputAreaWrapper from './_components/chat-input-area-wrapper';

export const dynamic = "force-static";
export const revalidate = 360;

export default async function chatPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col">
        <EmptySession/>
        <ChatInputAreaWrapper/>
    </div>
  );
}
