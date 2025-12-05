import { WeatherData, Coordinates } from '../types';

export const fetchWeather = async (coords: Coordinates): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather');
    }

    const data = await response.json();
    return {
      temperature: data.current_weather.temperature,
      weatherCode: data.current_weather.weathercode,
      windSpeed: data.current_weather.windspeed,
      isDay: data.current_weather.is_day,
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
};

export const getWeatherDescription = (code: number, lang: 'en' | 'bn'): string => {
  // Simplified WMO codes
  if (code === 0) return lang === 'bn' ? 'পরিষ্কার আকাশ' : 'Clear Sky';
  if (code >= 1 && code <= 3) return lang === 'bn' ? 'আংশিক মেঘলা' : 'Partly Cloudy';
  if (code >= 45 && code <= 48) return lang === 'bn' ? 'কুয়াশা' : 'Foggy';
  if (code >= 51 && code <= 67) return lang === 'bn' ? 'গুড়ি গুড়ি বৃষ্টি' : 'Drizzle/Rain';
  if (code >= 71) return lang === 'bn' ? 'তুষারপাত' : 'Snow'; // Rare in BD, but standard code
  if (code >= 80 && code <= 99) return lang === 'bn' ? 'বজ্রসহ বৃষ্টি' : 'Thunderstorm';
  return lang === 'bn' ? 'অজানা' : 'Unknown';
};