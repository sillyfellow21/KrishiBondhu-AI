
export type Language = 'en' | 'bn';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface CropInfo {
  id: string;
  nameEn: string;
  nameBn: string;
  season: string;
  plantingTime: string;
  harvestTime: string;
  image: string;
}

export interface Loan {
  id: string;
  lenderName: string;
  amount: number;
  startDate: string;
  dueDate: string;
  status: 'active' | 'paid';
  notes?: string;
}

export interface Reminder {
  id: string;
  title: string;
  body: string;
  date: string; // ISO Date string
  type: 'loan' | 'fertilizer' | 'general';
  relatedId?: string;
  isCompleted: boolean;
}

export enum Tab {
  HOME = 'HOME',
  CHAT = 'CHAT',
  SCAN = 'SCAN',
  CROPS = 'CROPS',
  LOANS = 'LOANS',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
