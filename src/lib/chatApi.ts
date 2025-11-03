const CHAT_API_URL = 'https://functions.poehali.dev/35949772-9ec1-4eb2-9d6e-8bdfba2d3323';

export interface ChatMessage {
  id: number;
  booking_id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  type: 'booking' | 'message' | 'review' | 'system';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export const chatApi = {
  async getMessages(bookingId: number, userId?: number): Promise<ChatMessage[]> {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['X-User-Id'] = String(userId);
    }

    const response = await fetch(`${CHAT_API_URL}?action=messages&booking_id=${bookingId}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    const data = await response.json();
    return data.messages || [];
  },

  async sendMessage(bookingId: number, senderId: number, message: string): Promise<void> {
    const response = await fetch(`${CHAT_API_URL}?action=send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        booking_id: bookingId,
        sender_id: senderId,
        message
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  },

  async getNotifications(userId: number): Promise<Notification[]> {
    const response = await fetch(`${CHAT_API_URL}?action=notifications`, {
      headers: {
        'X-User-Id': String(userId)
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    const data = await response.json();
    return data.notifications || [];
  },

  async getUnreadCount(userId: number): Promise<number> {
    const response = await fetch(`${CHAT_API_URL}?action=unread_count`, {
      headers: {
        'X-User-Id': String(userId)
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    
    const data = await response.json();
    return data.unread_count || 0;
  },

  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(`${CHAT_API_URL}?action=mark_read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notification_id: notificationId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  async markAllAsRead(userId: number): Promise<void> {
    const response = await fetch(`${CHAT_API_URL}?action=mark_all_read`, {
      method: 'PUT',
      headers: {
        'X-User-Id': String(userId)
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  async createNotification(
    userId: number,
    type: 'booking' | 'message' | 'review' | 'system',
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    const response = await fetch(`${CHAT_API_URL}?action=create_notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        type,
        title,
        message,
        link
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create notification');
    }
  }
};
