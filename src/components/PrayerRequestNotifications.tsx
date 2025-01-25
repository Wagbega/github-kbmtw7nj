import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PrayerRequest } from '../types';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrayerRequestNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let subscription: any;
    
    const initialize = async () => {
      await checkAdminStatus();
      subscription = subscribeToRequests();
    };

    initialize();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll consider all authenticated users as admins
      // until we add the is_admin column
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const subscribeToRequests = () => {
    return supabase
      .channel('prayer-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'prayer_requests'
        },
        (payload) => {
          const newRequest = payload.new as PrayerRequest;
          handleNewRequest(newRequest);
        }
      )
      .subscribe();
  };

  const handleNewRequest = (request: PrayerRequest) => {
    if (!isAdmin) return;
    
    setUnreadCount((prev) => prev + 1);
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                New Prayer Request
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {request.is_anonymous ? 'Anonymous' : 'Someone'} needs prayer
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  };

  if (!isAdmin || unreadCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6">
      <div className="relative">
        <Bell className="h-6 w-6 text-indigo-600" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      </div>
    </div>
  );
}