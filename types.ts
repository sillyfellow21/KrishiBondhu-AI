
export type Language = 'en' | 'bn';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  location?: string;
  password?: string;
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
  // New detailed fields
  idealTemp?: string;
  soilType?: string;
  commonDiseases?: string[];
  growthDuration?: string;
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
  PROFILE = 'PROFILE', // New Profile Tab
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
