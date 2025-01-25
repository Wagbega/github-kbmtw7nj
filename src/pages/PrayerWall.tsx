import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Shield,
  User,
  Send,
  X,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// TypeScript interfaces
interface Profile {
  username: string;
  avatar_url?: string;
}

interface PrayerRequest {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  is_private: boolean;
  created_at: string;
  title?: string;
  profiles?: Profile;
}

export default function PrayerWall() {
  // State management
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [newPrayer, setNewPrayer] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const AUDIO_STREAM_URL = 'https://example.com/prayer-stream.mp3';

  // Check if current time is within live session (Saturday 12 AM - 2 AM)
  const checkLiveSession = () => {
    const now = new Date();
    return now.getDay() === 6 && now.getHours() >= 0 && now.getHours() < 2;
  };

  // Calculate next session time
  const getNextSessionTime = () => {
    const now = new Date();
    let next = new Date();
    next.setDate(now.getDate() + ((6 + 7 - now.getDay()) % 7));
    next.setHours(0, 0, 0, 0);
    
    if (now > next) {
      next.setDate(next.getDate() + 7);
    }
    
    return format(next, "EEEE, MMMM d 'at' h:mm a");
  };

  // Realtime subscription setup
  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('prayer-wall')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayer_requests'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPrayer = payload.new as PrayerRequest;
            if (!newPrayer.is_private) {
              setPrayers(prev => [newPrayer, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            setPrayers(prev => prev.filter(prayer => prayer.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPrayers(prev => 
              prev.map(prayer => 
                prayer.id === payload.new.id ? { ...prayer, ...payload.new } : prayer
              )
            );
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  // Fetch prayers from Supabase
  const fetchPrayers = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('prayer_requests')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (user) {
        query = query.or(`is_private.eq.false,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_private', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      console.error('Error fetching prayers:', error);
      toast.error('Failed to load prayers');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle prayer submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to submit a prayer request');
        return;
      }

      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id: user.id,
          content: newPrayer,
          is_anonymous: isAnonymous,
          is_private: isPrivate,
          title: newPrayer.slice(0, 50) + (newPrayer.length > 50 ? '...' : '')
        });

      if (error) throw error;

      setNewPrayer('');
      setIsAnonymous(false);
      setIsPrivate(false);
      setShowPrayerForm(false);
      toast.success('Prayer request submitted');
      fetchPrayers();
    } catch (error) {
      console.error('Error submitting prayer:', error);
      toast.error('Failed to submit prayer request');
    }
  };

  // Audio control functions
  const toggleAudio = () => {
    if (!isLiveSessionActive) {
      toast.error('Live stream is only available during scheduled sessions');
      return;
    }

    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          const playPromise = audioRef.current.play();
          if (playPromise) {
            playPromise.catch(error => {
              console.error('Error playing audio:', error);
              toast.error('Unable to play audio stream');
              setIsPlaying(false);
            });
          }
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error toggling audio:', error);
        toast.error('Error controlling audio playback');
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      try {
        audioRef.current.volume = newVolume;
        if (newVolume > 0 && isMuted) {
          setIsMuted(false);
          audioRef.current.muted = false;
        }
      } catch (error) {
        console.error('Error changing volume:', error);
        toast.error('Error adjusting volume');
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      try {
        const newMutedState = !isMuted;
        audioRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
        if (!newMutedState && volume === 0) {
          setVolume(0.5);
          audioRef.current.volume = 0.5;
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
        toast.error('Error controlling audio');
      }
    }
  };

  // Prayer interaction handlers
  const handlePrayClick = async (prayerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to mark prayers');
        return;
      }

      const { error } = await supabase
        .from('prayer_interactions')
        .insert({
          user_id: user.id,
          prayer_id: prayerId,
          interaction_type: 'prayer'
        });

      if (error) throw error;
      toast.success('Prayer recorded');
    } catch (error) {
      console.error('Error recording prayer:', error);
      toast.error('Failed to record prayer');
    }
  };

  const handleShare = async (prayerId: string) => {
    try {
      const shareUrl = `${window.location.origin}/prayers/${prayerId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Prayer Request',
          text: 'Join me in prayer',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing prayer:', error);
      toast.error('Failed to share prayer');
    }
  };

  // Effects
  useEffect(() => {
    fetchPrayers();
    const unsubscribe = setupRealtimeSubscription();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const isActive = checkLiveSession();
      setIsLiveSessionActive(isActive);
      
      if (!isActive && isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        toast.info('Live session has ended');
      }
    };

    const interval = setInterval(checkSession, 60000);
    checkSession();
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      const handleError = (e: Event) => {
        console.error('Audio stream error:', e);
        setIsPlaying(false);
        toast.error('Error playing audio stream');
      };

      const handleEnded = () => setIsPlaying(false);

      audioRef.current.addEventListener('error', handleError);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', handleError);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, []);

  // Render prayer card component
  const PrayerCard = ({ prayer }: { prayer: PrayerRequest }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {prayer.is_anonymous ? (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
            ) : prayer.profiles?.avatar_url ? (
              <img
                src={prayer.profiles.avatar_url}
                alt={prayer.profiles.username}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {prayer.is_anonymous ? 'Anonymous' : prayer.profiles?.username}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {format(new Date(prayer.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {prayer.is_private && (
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{prayer.content}</p>
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <button 
            onClick={() => handlePrayClick(prayer.id)}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Pray</span>
          </button>
          <button className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Comment</span>
          </button>
          <button 
            onClick={() => handleShare(prayer.id)}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <audio ref={audioRef} src={AUDIO_STREAM_URL} />
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Prayer Wall
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community in prayer. Share your prayer requests and lift others up in prayer.
          </p>
        </div>

        {/* Live Session Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <Calendar className="h-6 w-6" />
              <div>
              <h3 className="font-semibold">Live Prayer Session</h3>
              <p className="text-sm text-indigo-100">
                Every Saturday 12 AM - 2 AM
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            {isLiveSessionActive ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-sm">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Live Now
              </span>
            ) : (
              <span className="text-sm">
                Next session: {getNextSessionTime()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAudio}
              className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isLiveSessionActive}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <div>
              <h3 className="font-semibold text-gray-900">Live Prayer Stream</h3>
              <p className="text-sm text-gray-500">
                {isLiveSessionActive 
                  ? "Join our live prayer session now"
                  : "Stream available during live sessions"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 sm:w-32"
              disabled={!isLiveSessionActive}
            />
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isLiveSessionActive}
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6 text-gray-600" />
              ) : (
                <Volume2 className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Prayer Form */}
      <div className="mb-6 sm:mb-8">
        {!showPrayerForm ? (
          <button
            onClick={() => setShowPrayerForm(true)}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center text-gray-600 hover:text-gray-900"
          >
            Share your prayer request...
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">New Prayer Request</h2>
              <button
                onClick={() => setShowPrayerForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={newPrayer}
                onChange={(e) => setNewPrayer(e.target.value)}
                placeholder="Share your prayer request here..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px]"
                required
              />
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Submit anonymously</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Keep private</span>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPrayerForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Prayer</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Prayer Wall Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : prayers.length > 0 ? (
          prayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No prayer requests yet. Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
}