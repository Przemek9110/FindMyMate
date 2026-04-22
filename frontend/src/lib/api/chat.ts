export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: crypto.randomUUID(),
      senderId: "1",
      text: "Hej! Miło Cię poznać 😊",
      createdAt: "2026-04-22T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      senderId: "me",
      text: "Cześć! Również mi miło.",
      createdAt: "2026-04-22T10:01:00Z",
    },
  ],
  "2": [
    {
      id: crypto.randomUUID(),
      senderId: "3",
      text: "Hej, widzę że też lubisz siłownię.",
      createdAt: "2026-04-22T11:00:00Z",
    },
  ],
};

export async function getChatMessages(userId: string): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...(mockMessages[userId] ?? [])];
}

export async function sendChatMessage(
  userId: string,
  text: string
): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "me",
    text,
    createdAt: new Date().toISOString(),
  };

  if (!mockMessages[userId]) {
    mockMessages[userId] = [];
  }

  mockMessages[userId] = [...mockMessages[userId], newMessage];

  return newMessage;
}