const AVAILABILITY_API_URL = 'https://functions.poehali.dev/ea1d4186-da9c-4a58-89f2-294ff85dc805';

export interface TourAvailability {
  tour_id: number;
  max_guests: number;
  availability: Record<string, number>; // date -> available slots
}

export const availabilityApi = {
  async getAvailability(tourId: number): Promise<TourAvailability> {
    const url = `${AVAILABILITY_API_URL}?tour_id=${tourId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }
    
    return await response.json();
  }
};
