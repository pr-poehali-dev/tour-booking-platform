const AUTH_API_URL = 'https://functions.poehali.dev/ef197ae1-9fe2-4462-8cf1-06214e5d2355';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  telegram?: string;
  city?: string;
  bio?: string;
  languages?: string;
  experience_years?: number;
  specialization?: string;
  interests?: string;
  email_notifications?: boolean;
  telegram_notifications?: boolean;
  created_at?: string;
}

export interface UpdateProfileData {
  user_id: number;
  name?: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  telegram?: string;
  city?: string;
  bio?: string;
  languages?: string;
  experience_years?: number;
  specialization?: string;
  interests?: string;
  email_notifications?: boolean;
  telegram_notifications?: boolean;
}

export const profileApi = {
  async getProfile(userId: number): Promise<UserProfile> {
    const response = await fetch(`${AUTH_API_URL}?user_id=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    
    return await response.json();
  },

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; message: string }> {
    const response = await fetch(AUTH_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    return await response.json();
  }
};
