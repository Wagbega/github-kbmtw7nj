import React, { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Bell, Share2, ChevronLeft, ChevronRight, Volume2, X } from 'lucide-react';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import toast from 'react-hot-toast';
import { requestNotificationPermission, scheduleNotification } from '../services/notificationService';
import { getBibleVerse, getRandomVerse } from '../services/bibleApi';
import NotificationSettings from './NotificationSettings';

interface Props {
  reading: {
    verse: string;
    text: string;
    date: string;
    translation?: string;
    reflection: string;
    audioUrl?: string;
  };
  onNavigate?: (direction: 'next' | 'previous') => void;
  onClose?: () => void;
}

export default function BibleReading({ reading: initialReading, onNavigate, onClose }: Props) {
  const [reading, setReading] = useState(initialReading);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleNotificationToggle = async () => {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      await scheduleNotification({
        id: 'daily-reading',
        userId: 'current-user',
        type: 'daily_reading',
        time: '09:00',
        enabled: true,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      });
      toast.success('Daily reading notifications enabled!');
    } else {
      toast.error('Please enable notifications in your browser settings');
    }
  };

  const handleNavigation = async (direction: 'next' | 'previous') => {
    setIsLoading(true);
    try {
      const newVerse = await getRandomVerse('JHN');
      if (newVerse) {
        setReading(newVerse);
      }
      onNavigate?.(direction);
    } catch (error) {
      toast.error('Failed to load verse');
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrl = window.location.href;
  const shareTitle = `Daily Bible Reading: ${reading.verse}`;

  return (
    <div className="relative flex flex-col w-full h-full bg-white rounded-xl shadow-lg overflow-hidden landscape:max-h-screen">
      {/* Header */}
      <div className="flex-none bg-indigo-600 text-white px-4 py-2 landscape:py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <h1 className="text-lg font-semibold landscape:text-base">Daily Bible Reading</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-indigo-100 text-sm hidden sm:inline">
              {format(new Date(reading.date), 'MMM d, yyyy')}
            </span>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-white hover:text-indigo-200 p-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow overflow-y-auto overscroll-contain landscape:pb-16">
        <div className="p-4 space-y-3 landscape:space-y-2">
          {/* Verse Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 landscape:text-base">
                {reading.verse}
              </h2>
              {reading.translation && (
                <span className="text-sm text-gray-500">({reading.translation})</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {reading.audioUrl && (
                <button className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg">
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="p-2 text-indigo-600 hover:text-indigo-800 rounded-lg md:hidden"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Verse Text */}
          <blockquote className="text-base landscape:text-sm text-gray-700 italic border-l-4 border-indigo-200 pl-4 py-2">
            "{reading.text}"
          </blockquote>

          {/* Reflection */}
          <div className="bg-indigo-50 p-3 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-1 landscape:text-sm">
              Today's Reflection
            </h3>
            <p className="text-gray-700 landscape:text-sm">{reading.reflection}</p>
          </div>

          {/* Share Options - Desktop */}
          <div className="hidden md:flex flex-wrap gap-2">
            <FacebookShareButton url={shareUrl} quote={shareTitle}>
              <span className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                Facebook
              </span>
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={shareTitle}>
              <span className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                Twitter
              </span>
            </TwitterShareButton>
            <WhatsappShareButton url={shareUrl} title={shareTitle}>
              <span className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                WhatsApp
              </span>
            </WhatsappShareButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none border-t border-gray-200 px-4 py-2 bg-white landscape:fixed landscape:bottom-0 landscape:left-0 landscape:right-0">
        <div className="w-full flex justify-between items-center">
          <button
            onClick={() => handleNavigation('previous')}
            className="flex items-center justify-center gap-1 px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
            disabled={isLoading}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline landscape:hidden">Previous</span>
          </button>
          <button
            onClick={() => handleNavigation('next')}
            className="flex items-center justify-center gap-1 px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
            disabled={isLoading}
          >
            <span className="hidden sm:inline landscape:hidden">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Share Options Modal */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:hidden z-50">
          <div className="w-full bg-white rounded-t-xl landscape:max-h-[50vh] landscape:overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold landscape:text-base">Share Reading</h3>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FacebookShareButton url={shareUrl} quote={shareTitle} className="w-full">
                  <span className="block w-full text-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                    Facebook
                  </span>
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle} className="w-full">
                  <span className="block w-full text-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                    Twitter
                  </span>
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={shareTitle} className="w-full">
                  <span className="block w-full text-center text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50">
                    WhatsApp
                  </span>
                </WhatsappShareButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md landscape:max-h-[90vh] landscape:overflow-y-auto">
            <NotificationSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
