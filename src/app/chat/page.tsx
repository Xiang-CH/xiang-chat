import ChatArea from "~/components/chat-area";

export default async function chatPage() {
  return (
    <div className="box-border h-full max-h-full w-full">
      <div className="h-full p-4">
        <ChatArea/>
      </div>
    </div>
  );
}
