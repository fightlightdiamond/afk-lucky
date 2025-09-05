"use client";

import { useChatStore } from "@/store";
import { cn } from "@/lib/utils";

export function ConversationList() {
  const conversations = useChatStore((s) => s.conversations);
  const currentId = useChatStore((s) => s.currentConversationId);
  const setCurrentConversation = useChatStore((s) => s.setCurrentConversation);

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No conversations</div>
    );
  }

  return (
    <ul className="divide-y">
      {conversations.map((conv) => (
        <li
          key={conv.id}
          onClick={() => setCurrentConversation(conv.id)}
          className={cn(
            "p-4 cursor-pointer hover:bg-accent",
            currentId === conv.id && "bg-accent"
          )}
        >
          {conv.name}
        </li>
      ))}
    </ul>
  );
}
