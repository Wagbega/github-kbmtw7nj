import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { MessageCircle, Share2, Heart, Volume2, X } from 'lucide-react';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import LiveChat from '../components/LiveChat';

interface Stream {
  id: string;
  name: string;
  url: string;
  description: string;
}

export default function LiveStream() {
  const [streams, setStreams] = useState<Record<string, Stream>>({});
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast.error('Failed to load live streams');
        console.error('Error fetching streams:', error);
        return;
      }

      const streamsMap: Record<string, Stream> = {};
      data?.forEach((stream: Stream) => {
        streamsMap[stream.id] = stream;
      });

      setStreams(streamsMap);
      if (data && data.length > 0) {
        setActiveStream(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast.error('Failed to load live streams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const title = activeStream ? `Live Service at ${streams[activeStream].name}` : 'Live Service';
    
    return (
      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-2 z-50">
        <div className="flex flex-col space-y-2">
          <FacebookShareButton 
            url={shareUrl} 
            quote={title}
            onClick={() => setShowShare(false)}
          >
            <div className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
              Share on Facebook
            </div>
          </FacebookShareButton>
          
          <TwitterShareButton 
            url={shareUrl} 
            title={title}
            onClick={() => setShowShare(false)}
          >
            <div className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
              Share on Twitter
            </div>
          </TwitterShareButton>
          
          <WhatsappShareButton 
            url={shareUrl} 
            title={title}
            onClick={() => setShowShare(false)}
          >
            <div className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
              Share on WhatsApp
            </div>
          </WhatsappShareButton>
        </div>
      </div>
    );
  };

  // Close share menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-share-menu]') && !target.closest('[data-share-button]')) {
        setShowShare(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live streams...</p>
        </div>
      </div>
    );
  }

  if (!activeStream || Object.keys(streams).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Live Streams Available</h2>
          <p className="text-gray-600">Please check back later for upcoming services.</p>
        </div>
      </div>
    );
  }

  const currentStream = streams[activeStream];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:flex-grow">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Stream Controls */}
              <div className="border-b p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    {Object.values(streams).map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => setActiveStream(stream.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          activeStream === stream.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {stream.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-end space-x-4 text-gray-600">
                    <button className="p-2 hover:text-indigo-600">
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 hover:text-indigo-600 relative"
                      onClick={() => setShowShare(!showShare)}
                      data-share-button
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    {showShare && (
                      <div data-share-menu>
                        {handleShare()}
                      </div>
                    )}
                    <button 
                      className="p-2 hover:text-red-600"
                      onClick={() => setShowChat(!showChat)}
                    >
                      {showChat ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative w-full h-0 pb-[56.25%] bg-black">
                <div className="absolute inset-0">
                  <ReactPlayer
                    url={currentStream.url}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    playsinline
                  />
                </div>
              </div>
              
              {/* Stream Info */}
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{currentStream.name}</h2>
                <p className="text-gray-600 mb-6">{currentStream.description}</p>
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Service Times:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { day: 'Sunday', time: '9:00 AM', name: 'Morning Service' },
                      { day: 'Sunday', time: '11:00 AM', name: 'Main Service' },
                      { day: 'Wednesday', time: '7:00 PM', name: 'Bible Study' },
                    ].map((service, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-indigo-600">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.day} at {service.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          {showChat && activeStream && (
            <div className="fixed inset-x-0 bottom-0 lg:relative lg:w-96 z-50 lg:z-0">
              <div className="bg-white shadow-lg lg:shadow-md h-[70vh] lg:h-[600px] flex flex-col rounded-t-xl lg:rounded-lg">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Live Chat</h3>
                    <button 
                      onClick={() => setShowChat(false)}
                      className="lg:hidden p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <LiveChat streamId={activeStream} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}