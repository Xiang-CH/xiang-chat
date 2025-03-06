"use client";

import { TabsContent } from "~/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useState } from "react";

export default function AccountPage() {
  const { user } = useUser();
  const clerk = useClerk();
  const [newEmail, setNewEmail] = useState("");

  const handleAddEmail = () => {
    const email = prompt("Enter your email address");
    if (!email || !user) return;
    
    user.createEmailAddress({
      email: email
    })
      .then(() => {
        toast.success("Email added successfully. Please check your inbox for verification.");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to add email");
      });
  };



  if (!user) return null;
  
  return (
    <TabsContent value="account">
      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <img
            src={user.imageUrl}
            className="w-40 rounded-full"
            alt="User Profile Pic"
          />
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-4">
            {user.fullName}
          </h4>
        </div>

        <main className="flex-grow pr-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Email Addresses</h2>
              <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Add Email</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Email Address</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleAddEmail} className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Add Email</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
            </div>
            
            <div className="space-y-2">
              {user.emailAddresses.map((email) => (
                <div 
                  key={email.id} 
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span>{email.emailAddress}</span>
                    {email.id === user.primaryEmailAddressId && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Primary
                      </span>
                    )}
                    {email.verification?.status === "verified" && (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                        Verified
                      </span>
                    )}
                  </div>
                  {user.emailAddresses.length > 1 && email.id !== user.primaryEmailAddressId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                    >
                      Make Primary
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Connected Accounts</h2>
              <Button variant="outline">
                Connect Account
              </Button>
            </div>
            
            <div className="space-y-2">
              {user.externalAccounts.map((account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{account.provider}</span>
                    <span className="text-sm text-muted-foreground">
                      {account.emailAddress}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </TabsContent>
  );
}
