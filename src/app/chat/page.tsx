import EmptySession from './_components/empty-session';
import ChatInputAreaWrapper from './_components/chat-input-area-wrapper';

export default async function chatPage() {
  return (
    <div className="h-full w-full">
        <EmptySession/>
        <ChatInputAreaWrapper/>
    </div>
  );
}
