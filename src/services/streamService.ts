import { supabase } from '../lib/supabaseClient';
import { ChatMessage } from '../types';

export const streamService = {
  // Send chat message
  async sendMessage(streamId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from('stream_chat')
      .insert({
        stream_id: streamId,
        user_id: userId,
        message: message
      })
      .select('*, user:profiles(username, avatar_url)')
      .single();

    if (error) throw error;
    return data as ChatMessage;
  },

  // Subscribe to chat messages
  subscribeToChat(streamId: string, onMessage: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat_${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_chat',
          filter: `stream_id=eq.${streamId}`
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();
  },

  // Get recent chat messages
  async getRecentMessages(streamId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('stream_chat')
      .select('*, user:profiles(username, avatar_url)')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ChatMessage[];
  }
};