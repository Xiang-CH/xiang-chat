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
import { SidebarTab, NewChatButton, NewSessionTab } from "./sidebar-buttons";

import { loadSessionsByUserId } from "~/lib/session-store";
import { ScrollArea } from "~/components/ui/scroll-area";

export async function AppSidebar(): Promise<JSX.Element> {
	const { userId } = await auth();

	const conversations = await loadSessionsByUserId(userId);

	return (
		<Sidebar className="border-r-[1px] border-sidebar-border">
			<SidebarHeader className="mt-2 px-4">
				<NewChatButton />
			</SidebarHeader>
			<SidebarContent className="relative max-w-full">
		
				<ScrollArea className="h-full w-full relative">
					<SidebarGroup className="flex max-w-[16rem] flex-col px-4 gap-[2px]">
						<NewSessionTab sessions={conversations}/>
						{conversations.map((conversation) => (
							<SidebarTab conversation={conversation} key={conversation.sessionId}/>
						))}
					</SidebarGroup>
				</ScrollArea>

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
