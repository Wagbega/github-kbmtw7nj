import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Archive, ArrowRight, MapPin, Clock, Bell, Heart, X, CreditCard, Users, Music, BookOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { BibleReading as BibleReadingType, Event } from '../types';
import BibleReading from '../components/BibleReading';
import { getBibleVerse } from '../services/bibleApi';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showBibleReading, setShowBibleReading] = useState(true);
  const [events, setEvents] = useState < Event[] > ([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyReading, setDailyReading] = useState < BibleReadingType > ({
    date: new Date().toISOString(),
    verse: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
    reflection: "This powerful verse reminds us that with God's strength, we can overcome any challenge."
  });

  useEffect(() => {
    fetchEvents();
    const fetchDailyVerse = async () => {
      const verse = await getBibleVerse('JHN.3.16');
      setDailyReading(verse);
    };
    fetchDailyVerse();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date
  const formatEventDate = (date: string) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };

  // Helper function to format time
  const formatEventTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
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

  const handleReadingNavigation = (direction: 'next' | 'previous') => {
    console.log(`Navigating ${direction}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:20px_20px] opacity-10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              Welcome to The Sanctuary Of Holy Spirit
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto">
              Connect, Worship, Grow - Join our community in praising God and growing in faith together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/live"
                className="inline-flex items-center px-8 py-4 rounded-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
              >
                <Video className="h-5 w-5 mr-2" />
                Watch Live
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center px-8 py-4 rounded-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-indigo-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </Link>
              <button
                onClick={() => setShowDonateModal(true)}
                className="inline-flex items-center px-8 py-4 rounded-lg font-semibold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate
              </button>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-24" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24.9999C240 74.9999 480 74.9999 720 49.9999C960 24.9999 1200 -25.0001 1440 24.9999V73.9999H0V24.9999Z" fill="currentColor" className="text-gray-50" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold">New Here?</h2>
            </div>
            <p className="text-gray-600 mb-4">
              We'd love to welcome you to our church family. Join us this Sunday and experience God's love.
            </p>
            <Link to="/about" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              Learn More <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Music className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold">Worship With Us</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Join our worship services every Sunday at 9:00 AM and 12:00 PM. Experience powerful praise and worship.
            </p>
            <Link to="/live" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              Watch Live <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold">Bible Study</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Grow in your faith through our weekly Bible studies and small groups. All are welcome to join.
            </p>
            <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              View Schedule <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Featured Events Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Upcoming Events
              </h2>
              <p className="text-gray-600 mt-2">Join us in our upcoming activities and celebrations</p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors group"
            >
              <span className="font-semibold">View All Events</span>
              <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80'})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {event.type && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(event.type)}`}>
                          {event.type}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeBadge(event.date).class}`}>
                        {getTimeBadge(event.date).text}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <span>{formatEventTime(event.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        to="/events"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium w-full justify-center group"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming events at the moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Sermons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Sermons</h2>
          <div className="space-y-6">
            {[
              {
                title: "The Power of Faith",
                preacher: "Pastor John Smith",
                date: "March 10, 2024",
                duration: "45:30"
              },
              {
                title: "Walking in Love",
                preacher: "Pastor Sarah Johnson",
                date: "March 3, 2024",
                duration: "38:15"
              }
            ].map((sermon, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-semibold mb-1">{sermon.title}</h3>
                  <div className="text-sm text-gray-600">
                    <span>{sermon.preacher}</span>
                    <span className="mx-2">•</span>
                    <span>{sermon.date}</span>
                  </div>
                </div>
                <Link
                  to="/archive"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Watch
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              to="/archive"
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <span>Browse Sermon Archive</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Bible Reading */}
      {showBibleReading && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:inset-x-auto sm:right-6 p-4 sm:p-0 w-full sm:w-full sm:max-w-lg">
          <div className="relative">
            <button
              onClick={() => setShowBibleReading(false)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 z-10"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
            <BibleReading
              reading={dailyReading}
              onNavigate={handleReadingNavigation}
            />
          </div>
        </div>
      )}

      {/* Restore Bible Reading Button */}
      {!showBibleReading && (
        <button
          onClick={() => setShowBibleReading(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Bell className="h-5 w-5" />
          <span>Show Daily Reading</span>
        </button>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Support Our Ministry</h2>
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bank Transfer Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="font-medium">Union Bank Of Nigeria</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-medium">0018571148</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-medium">C&S Church Idasa</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Swift Code</p>
                      <p className="font-medium">----------</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Bank Transfer Details - Account 2
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="font-medium">Access Bank</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-medium">0049229114</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-medium">C&S Church Idasa</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Swift Code</p>
                      <p className="font-medium">----------</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">Your donation helps us:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Support community outreach programs</li>
                    <li>Maintain and improve our facilities</li>
                    <li>Provide assistance to those in need</li>
                  </ul>
                </div>

                <div className="text-center text-sm text-gray-600">
                  For any questions about donations,
                  please contact church secretary.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}