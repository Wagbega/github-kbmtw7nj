import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, User, Video, Music, Clock, Download, Search, Filter, X } from 'lucide-react';
import { Service, AudioSermon } from '../types';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Archive() {
  const [services, setServices] = useState<Service[]>([]);
  const [audioSermons, setAudioSermons] = useState<AudioSermon[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioSermon | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPreacher, setFilterPreacher] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('date', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch audio sermons
      const { data: sermonsData, error: sermonsError } = await supabase
        .from('audio_sermons')
        .select('*')
        .order('date', { ascending: false });

      if (sermonsError) throw sermonsError;
      setAudioSermons(sermonsData || []);
    } catch (error) {
      console.error('Error fetching archive data:', error);
      toast.error('Failed to load archive data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (sermon: AudioSermon) => {
    try {
      setDownloading(sermon.id);
      const response = await fetch(sermon.audio_url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sermon.title}.mp3`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sermon');
    } finally {
      setDownloading(null);
    }
  };

  const filteredAudioSermons = audioSermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPreacher = !filterPreacher || sermon.preacher === filterPreacher;
    
    return matchesSearch && matchesPreacher;
  });

  const uniquePreachers = Array.from(new Set(audioSermons.map(sermon => sermon.preacher)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Service Archive</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
              activeTab === 'video'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Video className="h-5 w-5" />
            <span>Video Services</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
              activeTab === 'audio'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Music className="h-5 w-5" />
            <span>Audio Sermons</span>
          </button>
        </div>

        {activeTab === 'audio' && !selectedAudio && (
          <div className="mb-8 space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search sermons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preacher
                  </label>
                  <select
                    value={filterPreacher}
                    onChange={(e) => setFilterPreacher(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">All Preachers</option>
                    {uniquePreachers.map(preacher => (
                      <option key={preacher} value={preacher}>{preacher}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedService && activeTab === 'video' && (
          <div className="mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <ReactPlayer
                url={selectedService.video_url}
                width="100%"
                height="100%"
                controls
              />
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="text-indigo-600 hover:text-indigo-800 mb-4"
            >
              ← Back to archive
            </button>
          </div>
        )}

        {selectedAudio && activeTab === 'audio' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">{selectedAudio.title}</h2>
              <div className="flex items-center space-x-4 mb-4">
                <span className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {selectedAudio.preacher}
                </span>
                <span className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {selectedAudio.duration}
                </span>
              </div>
              <audio
                controls
                className="w-full mb-4"
                src={selectedAudio.audio_url}
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedAudio(null)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  ← Back to archive
                </button>
                <button
                  onClick={() => handleDownload(selectedAudio)}
                  disabled={downloading === selectedAudio.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading === selectedAudio.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && !selectedService && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedService(service)}
              >
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${service.thumbnail_url})` }}
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(service.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <User className="h-4 w-4 mr-2" />
                    <span>{service.preacher}</span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{service.description}</p>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No video services available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audio' && !selectedAudio && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudioSermons.map((sermon) => (
              <div 
                key={sermon.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedAudio(sermon)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{sermon.title}</h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(sermon.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 mb-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {sermon.preacher}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {sermon.duration}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{sermon.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(sermon);
                    }}
                    disabled={downloading === sermon.id}
                    className="mt-4 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading === sermon.id ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {filteredAudioSermons.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No audio sermons found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}