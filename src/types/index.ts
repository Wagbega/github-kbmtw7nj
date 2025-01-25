export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  is_admin?: boolean;
}

export interface PrayerRequest {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  is_private: boolean;
  created_at: string;
}

export interface Testimony {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  type: string;
}

export interface Service {
  id: string;
  title: string;
  date: string;
  video_url: string;
  description: string;
  thumbnail_url: string;
  preacher: string;
}

export interface AudioSermon {
  id: string;
  title: string;
  date: string;
  audio_url: string;
  description: string;
  preacher: string;
  duration: string;
}

export interface BibleReading {
  date: string;
  verse: string;
  text: string;
  reflection: string;
  book?: string;
  translation?: string;
  audio_url?: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type: 'daily_reading' | 'prayer_request' | 'event';
  time: string;
  enabled: boolean;
  days: string[];
}

export interface ChatMessage {
  id: string;
  user_id: string;
  stream_id: string;
  message: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}