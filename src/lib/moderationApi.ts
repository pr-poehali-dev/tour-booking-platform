const MODERATION_API_URL = 'https://functions.poehali.dev/4205f6df-712e-4186-9500-1a40b5b4ccbc';

export interface ModerationRequest {
  tour_id: number;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ModerationResponse {
  success: boolean;
  tour_id: number;
  action: string;
  new_status: string;
}

export const moderationApi = {
  async moderateTour(request: ModerationRequest): Promise<ModerationResponse> {
    const response = await fetch(MODERATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error('Failed to moderate tour');
    }
    
    return await response.json();
  },

  async approveTour(tourId: number): Promise<ModerationResponse> {
    return this.moderateTour({
      tour_id: tourId,
      action: 'approve'
    });
  },

  async rejectTour(tourId: number, reason: string): Promise<ModerationResponse> {
    return this.moderateTour({
      tour_id: tourId,
      action: 'reject',
      reason
    });
  }
};
