"use client";

import { useChatStore } from "@/store";

export function MessageList() {
  const currentId = useChatStore((s) => s.currentConversationId);
  const conversations = useChatStore((s) => s.conversations);

  const messages =
    conversations.find((c) => c.id === currentId)?.messages ?? [];

  return (
    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className="p-2 rounded bg-secondary">
          <div className="text-xs text-muted-foreground mb-1">
            {msg.sender}
          </div>
          <div>{msg.content}</div>
        </div>
      ))}
      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground">No messages</p>
      )}
    </div>
  );
}
