"use client";

import { FormEvent } from "react";
import { useChatStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MessageInput() {
  const draft = useChatStore((s) => s.draftMessage);
  const setDraft = useChatStore((s) => s.setDraftMessage);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type a message"
        className="flex-1"
      />
      <Button type="submit">Send</Button>
    </form>
  );
}
