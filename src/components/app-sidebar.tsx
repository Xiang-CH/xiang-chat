import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
} from "~/components/ui/sidebar";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "./ui/button";
import Link from "next/link";

import { loadSessionsByUserId } from "~/lib/session-store";

export async function AppSidebar(): Promise<JSX.Element> {
	const { userId } = await auth();

	const conversations = await loadSessionsByUserId(userId);

	return (
		<Sidebar className="border-r-[1px] border-sidebar-border">
			<SidebarHeader className="mt-2 px-4">
				<Link href="/chat" className="w-full">
					<Button variant="outline" className="shadow-none w-full">
						New Conversation
					</Button>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="flex w-full flex-col px-4">
					{conversations.map((conversation) => (
						<Link
							key={conversation.sessionId}
							href={`/chat/${conversation.sessionId}`}
							className="w-full rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							{conversation.sessionTitle}
						</Link>
					))}
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="flex h-16 items-center justify-center border-t-[1px] border-sidebar-border py-4">
				<SignedIn>
					<div className="flex w-full items-center px-4">
						<UserButton
							appearance={{
								elements: {
									userButtonBox:
										"w-full flex items-center justify-center gap-1 flex-row-reverse text-foreground",
								},
							}}
							showName
						/>
					</div>
				</SignedIn>
				<SignedOut>
					<SignInButton mode="modal">
						<Button className="h-full w-40">Sign in</Button>
					</SignInButton>
				</SignedOut>
			</SidebarFooter>
		</Sidebar>
	);
}
