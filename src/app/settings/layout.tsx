import { SignOutButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto h-full w-full max-w-[60rem] bg-background px-4 py-6">
      <header className="mb-8 mt-4 flex w-full justify-between">
        <Link href="/chat">
          <Button variant="ghost" className="pl-2">
            <ArrowLeftIcon />
            <span>Back to Chat</span>
          </Button>
        </Link>

        <SignOutButton redirectUrl="/chat">
          <Button variant="ghost">
            <span>Sign Out</span>
            <ExitIcon />
          </Button>
        </SignOutButton>
      </header>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="account" className="w-full">
						<Link href="/settings/account">
							Account
						</Link>
          </TabsTrigger>
          <TabsTrigger value="customization" className="w-full">
            Customization
          </TabsTrigger>
        </TabsList>
        {/* <TabsContent value="account">
          <div className="flex">
						<div>
						<img src={user?.imageUrl} className="w-40 rounded-full" alt="User Profile Pic"/>
            <div>{user?.firstName}</div>
						</div>
          </div>
        </TabsContent> */}
				<pre className="py-6 px-2">
					{children}
				</pre>
      </Tabs>
    </div>
  );
}
