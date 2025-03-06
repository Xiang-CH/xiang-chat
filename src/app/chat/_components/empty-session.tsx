import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";

export default function EmptySession() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center px-8 h-[100vh]">
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
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
    </div>
  ); 
}