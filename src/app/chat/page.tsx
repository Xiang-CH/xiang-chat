import ChatArea from "~/components/chat-area";

export const dynamic = "force-dynamic";

export default async function chatPage() {
  return (
    <div className="h-full w-full">
        <ChatArea/>
    </div>
  );
}
