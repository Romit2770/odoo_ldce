import { apiClient } from "./client";

export type NotificationItem = {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
};

export const notificationService = {
  async getAll(): Promise<NotificationItem[]> {
    return apiClient<NotificationItem[]>("/notifications");
  },

  async markAsRead(id: string | number): Promise<{ markedReadId: number }> {
    return apiClient<{ markedReadId: number }>(`/notifications/${id}/read`, {
      method: "POST",
    });
  },
};
