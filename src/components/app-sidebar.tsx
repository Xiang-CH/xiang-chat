import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "~/components/ui/sidebar"
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'
import { db } from "~/server/db";
import { Button } from "./ui/button";
  
export async function AppSidebar(): Promise<JSX.Element> {
    const conversations = await db.query.posts.findMany();
    return (
        <Sidebar>
        <SidebarHeader />
        <SidebarContent>
            <SidebarGroup>
                {conversations.map((conversation) => (
                    <div key={conversation.id}>{conversation.name}</div>
                ))}
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="py-4 border-t-[1px] h-16 flex items-center justify-center">
            <SignedIn>
                <div className="w-full px-4">
                    <UserButton appearance={{
                        elements: {
                            userButtonBox: "w-full flex items-center justify-center gap-1 flex-row-reverse",
                        }
                    }} showName/>
                </div>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button className="h-full w-40">Sign in</Button>
                </SignInButton>
            </SignedOut>
        </SidebarFooter>
        </Sidebar>
    )
}
