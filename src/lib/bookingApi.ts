const BOOKING_API_URL = 'https://functions.poehali.dev/2b4d691b-a242-40f0-ab27-cee036ce7a7c';

export interface TourDate {
  date: string;
  available_slots: number;
}

export interface Booking {
  id: number;
  tour_id: number;
  tour_title: string;
  city: string;
  image_url: string;
  guide_name: string;
  guide_avatar: string;
  booking_date: string;
  guests_count: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface CreateBookingRequest {
  tour_id: number;
  client_id: number;
  booking_date: string;
  guests_count: number;
  client_name: string;
  client_telegram?: string;
}

export interface CreateBookingResponse {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
}

export const bookingApi = {
  async getTourDates(tourId: number): Promise<TourDate[]> {
    const response = await fetch(`${BOOKING_API_URL}?action=tour_dates&tour_id=${tourId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tour dates');
    }
    
    const data = await response.json();
    return data.dates || [];
  },

  async getUserBookings(userId: number): Promise<Booking[]> {
    const response = await fetch(`${BOOKING_API_URL}?action=user_bookings`, {
      headers: {
        'X-User-Id': String(userId)
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user bookings');
    }
    
    const data = await response.json();
    return data.bookings || [];
  },

  async createBooking(bookingData: CreateBookingRequest): Promise<CreateBookingResponse> {
    const response = await fetch(BOOKING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    return await response.json();
  },

  async confirmBooking(bookingId: number): Promise<void> {
    const response = await fetch(BOOKING_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        booking_id: bookingId,
        action: 'confirm'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to confirm booking');
    }
  },

  async cancelBooking(bookingId: number): Promise<void> {
    const response = await fetch(BOOKING_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        booking_id: bookingId,
        action: 'cancel'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }
  }
};
