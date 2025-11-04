const TOURS_API_URL = 'https://functions.poehali.dev/4c1ca0b4-cf0f-45df-b42e-d029cfb0b520';

export interface Tour {
  id: number;
  title: string;
  city: string;
  price: number;
  duration: number;
  short_description: string;
  full_description: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  guide_name: string;
  guide_avatar: string;
  instant_booking: boolean;
}

export interface ToursResponse {
  tours: Tour[];
  total: number;
  cities: string[];
  limit: number;
  offset: number;
}

export interface ToursFilters {
  city?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTourData {
  title: string;
  city: string;
  price: number;
  duration: number;
  short_description: string;
  full_description: string;
  instant_booking: boolean;
  image_url: string;
}

export const toursApi = {
  async getTours(filters?: ToursFilters): Promise<ToursResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.city) params.append('city', filters.city);
      if (filters.min_price) params.append('min_price', String(filters.min_price));
      if (filters.max_price) params.append('max_price', String(filters.max_price));
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.offset) params.append('offset', String(filters.offset));
    }
    
    const url = params.toString() ? `${TOURS_API_URL}?${params.toString()}` : TOURS_API_URL;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tours');
    }
    
    return await response.json();
  },

  async createTour(tourData: CreateTourData): Promise<Tour> {
    const response = await fetch(TOURS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create tour');
    }
    
    return await response.json();
  }
};