import ChatArea from "~/components/chat-area";
import EmptySession from '~/components/empty-session';

export default async function chatPage() {
  return (
    <div className="h-full w-full">
        <EmptySession/>
        <ChatArea/>
    </div>
  );
}
