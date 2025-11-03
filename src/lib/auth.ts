export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'guide' | 'admin';
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
};
