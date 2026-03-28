"use client";

import { useState, useEffect } from "react";
import {
  getMessages,
  sendMessage as sendMsg,
  subscribeToMessages,
  addMessageReaction,
} from "../lib/supabase-api";

export function useMessages(deptId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deptId) return;

    fetchMessages();

    // Subscribe to real-time messages
    const subscription = subscribeToMessages(deptId, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        const exists = prev.some((msg) => msg.id === newMessage.id);
        return exists ? prev : [...prev, newMessage];
      });
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [deptId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(deptId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    try {
      await sendMsg(deptId, content);
      // Re-fetch messages to ensure we have the latest
      await fetchMessages();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await addMessageReaction(messageId, emoji);
      // Update message reactions in local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                message_reactions: [
                  ...(msg.message_reactions || []),
                  { emoji },
                ],
              }
            : msg,
        ),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    addReaction,
    refetch: fetchMessages,
  };
}
