"use client";

import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export function ChatWindow() {
  return (
    <div className="flex h-full border rounded-lg overflow-hidden">
      <aside className="w-64 border-r">
        <ConversationList />
      </aside>
      <section className="flex flex-1 flex-col">
        <MessageList />
        <MessageInput />
      </section>
    </div>
  );
}
