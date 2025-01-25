import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import { Event } from '../types';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get badge color based on event type
  const getBadgeColor = (type: string) => {
    const colors = {
      'Service': 'bg-blue-100 text-blue-800',
      'Youth': 'bg-purple-100 text-purple-800',
      'Outreach': 'bg-green-100 text-green-800',
      'Workshop': 'bg-yellow-100 text-yellow-800',
      'Prayer': 'bg-indigo-100 text-indigo-800',
      'Special': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  // Helper function to get relative time badge
  const getTimeBadge = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Event Passed', class: 'bg-gray-100 text-gray-600' };
    }
    if (diffDays === 0) {
      return { text: 'Today', class: 'bg-green-100 text-green-800' };
    }
    if (diffDays === 1) {
      return { text: 'Tomorrow', class: 'bg-blue-100 text-blue-800' };
    }
    if (diffDays <= 7) {
      return { text: `${diffDays} days away`, class: 'bg-indigo-100 text-indigo-800' };
    }
    return { text: `${diffDays} days away`, class: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
        
        {events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${event.image_url})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeBadge(event.date).class}`}>
                      {getTimeBadge(event.date).text}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(event.date), 'MMMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming events at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}