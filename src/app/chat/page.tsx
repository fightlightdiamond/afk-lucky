'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch('/api/socket');
    socket = io({ path: '/api/socket' });
    socket.on('message', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket?.off('message');
      socket?.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    setInput('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input
        className="border p-2 mr-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="border px-4 py-2" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
