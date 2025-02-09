import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "~/components/ui/sidebar"
import { db } from "~/server/db";
  
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
        <SidebarFooter />
        </Sidebar>
    )
}
