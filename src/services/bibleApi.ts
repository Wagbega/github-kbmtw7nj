import axios from 'axios';
import { BibleReading } from '../types';

const API_KEY = 'f1046c47ac7fa8e9bc7812c715ec8262';
const BASE_URL = 'https://api.scripture.api.bible/v1';
const BIBLE_ID = 'de4e12af7f28f599-02'; // English Standard Version (ESV)

interface BibleApiVerse {
  data: {
    id: string;
    orgId: string;
    bookId: string;
    chapterIds: string[];
    reference: string;
    content: string;
    verseCount: number;
    copyright: string;
  };
}

export const getBibleVerse = async (reference: string): Promise<BibleReading> => {
  try {
    const response = await axios.get<BibleApiVerse>(
      `${BASE_URL}/bibles/${BIBLE_ID}/verses/${reference}`,
      {
        headers: {
          'api-key': API_KEY,
          'accept': 'application/json'
        }
      }
    );

    // Clean the content by removing HTML tags
    const cleanContent = response.data.data.content.replace(/<[^>]*>/g, '');

    return {
      date: new Date().toISOString(),
      verse: response.data.data.reference,
      text: cleanContent,
      reflection: "Today's reflection will help you apply this verse to your life...",
      book: response.data.data.bookId,
      translation: 'ESV'
    };
  } catch (error) {
    // Safe error logging that won't cause DataCloneError
    if (error instanceof Error) {
      console.error('Error fetching Bible verse:', error.message);
    } else {
      console.error('Error fetching Bible verse');
    }
    
    // Return fallback verse
    return {
      date: new Date().toISOString(),
      verse: "Philippians 4:13",
      text: "I can do all things through Christ who strengthens me.",
      reflection: "This powerful verse reminds us that with God's strength, we can overcome any challenge.",
      translation: 'ESV'
    };
  }
};

// Get a list of available Bibles
export const getBibles = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/bibles`, {
      headers: {
        'api-key': API_KEY
      }
    });
    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching Bibles:', error.message);
    } else {
      console.error('Error fetching Bibles');
    }
    return [];
  }
};

// Get a random verse from a specific book
export const getRandomVerse = async (bookId: string) => {
  try {
    // First, get the chapters in the book
    const chaptersResponse = await axios.get(
      `${BASE_URL}/bibles/${BIBLE_ID}/books/${bookId}/chapters`,
      {
        headers: {
          'api-key': API_KEY
        }
      }
    );
    
    const chapters = chaptersResponse.data.data;
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
    
    // Then get verses from the random chapter
    const versesResponse = await axios.get(
      `${BASE_URL}/bibles/${BIBLE_ID}/chapters/${randomChapter.id}/verses`,
      {
        headers: {
          'api-key': API_KEY
        }
      }
    );
    
    const verses = versesResponse.data.data;
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    
    return getBibleVerse(randomVerse.id);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error getting random verse:', error.message);
    } else {
      console.error('Error getting random verse');
    }
    return null;
  }
};