"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store";

export default function NewGroupPage() {
  const [name, setName] = useState("");
  const addConversation = useChatStore((s) => s.addConversation);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addConversation(name.trim());
    setName("");
    router.push("/chat");
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
        />
        <Button type="submit">Create Group</Button>
      </form>
    </div>
  );
}
