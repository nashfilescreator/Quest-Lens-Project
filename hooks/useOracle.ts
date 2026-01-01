
import { useCallback, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useOracle = (userId: string) => {
    const history = useQuery(api.oracle.getHistory, { userId }) || [];
    const addMessageMutation = useMutation(api.oracle.addMessage);
    const clearHistoryMutation = useMutation(api.oracle.clearHistory);

    const sendMessage = useCallback(async (text: string, sender: 'user' | 'ai', sources?: { uri: string; title: string }[]) => {
        await addMessageMutation({
            userId,
            sender,
            text,
            sources
        });
    }, [userId, addMessageMutation]);

    const clearHistory = useCallback(async () => {
        await clearHistoryMutation({ userId });
    }, [userId, clearHistoryMutation]);

    return {
        history,
        sendMessage,
        clearHistory
    };
};
