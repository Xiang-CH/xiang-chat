import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function EmptySession() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <SignedIn>
        <h1 className="mb-6 scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          How can I help you?
        </h1>
      </SignedIn>
      <SignedOut>
        <h1 className="mb-6 scroll-m-20 text-2xl font-semibold tracking-tight">
          This a beta site for invited user only,
          <br />
          Please sign in to chat
        </h1>
      </SignedOut>
    </div>
  );
}