import { apiFetch } from "./api";

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

type BackendMessage = {
  id: number;
  sender_profile_id: number;
  content: string;
};

type MessagesResponse = {
  match_id: number;
  messages: BackendMessage[];
};

type SendMessageResponse = BackendMessage & {
  message: string;
  match_id: number;
};

function mapMessage(message: BackendMessage): Message {
  return {
    id: String(message.id),
    senderId: String(message.sender_profile_id),
    text: message.content,
    createdAt: new Date().toISOString(),
  };
}

export async function getChatMessages(
  matchId: number | string
): Promise<Message[]> {
  const data = await apiFetch<MessagesResponse>(`/messages/${matchId}`);
  return data.messages.map(mapMessage);
}

export async function sendChatMessage(
  matchId: number | string,
  senderProfileId: number | string,
  text: string
): Promise<Message> {
  const data = await apiFetch<SendMessageResponse>("/messages", {
    method: "POST",
    body: JSON.stringify({
      match_id: Number(matchId),
      sender_profile_id: Number(senderProfileId),
      content: text,
    }),
  });

  return mapMessage(data);
}
