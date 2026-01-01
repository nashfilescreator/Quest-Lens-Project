
import { useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatMessage } from '../types';

export const useChat = (chatId: string | null | undefined) => {
  const messages = useQuery(api.messages.getChannel, { channelId: chatId || 'global' }) || [];
  const sendMutation = useMutation(api.messages.send);

  const sendMessage = useCallback(async (text: string, user: { id: string; name: string; avatar: string }) => {
    if (!chatId) return;
    
    await sendMutation({
      channelId: chatId,
      text,
      senderId: user.id,
      senderName: user.name,
      avatarSeed: user.avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }, [chatId, sendMutation]);

  // Transform Convex messages to match app types if necessary, though schema matches
  return { 
    messages: [...messages].reverse(), // Convex returns desc, UI might expect asc or handled by CSS
    sendMessage 
  };
};
