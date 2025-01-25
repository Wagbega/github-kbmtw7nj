import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, PrayerRequest, Testimony } from '../types';
import { 
  User, 
  PenSquare, 
  Trash2, 
  Eye, 
  EyeOff, 
  MessageCircle, 
  LogOut, 
  Plus,
  Calendar,
  Camera,
  Shield,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import Auth from '../components/Auth';
import { format } from 'date-fns';

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewPrayerRequest, setShowNewPrayerRequest] = useState(false);
  const [showNewTestimony, setShowNewTestimony] = useState(false);
  const [activeTab, setActiveTab] = useState<'prayer' | 'testimony'>('prayer');
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
  });
  const [newPrayerRequest, setNewPrayerRequest] = useState({
    title: '',
    content: '',
    isAnonymous: false,
    isPrivate: false,
  });
  const [newTestimony, setNewTestimony] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserData(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchUserData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserData(userId: string) {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          fullName: profileData.full_name || '',
          bio: profileData.bio || '',
        });
      }

      const { data: prayerData, error: prayerError } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (prayerError) throw prayerError;
      setPrayerRequests(prayerData || []);

      const { data: testimonyData, error: testimonyError } = await supabase
        .from('testimonies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (testimonyError) throw testimonyError;
      setTestimonies(testimonyData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleUpdateProfile = async () => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.fullName,
          bio: formData.bio,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile({
        ...profile!,
        username: formData.username,
        full_name: formData.fullName,
        bio: formData.bio,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSubmitPrayerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    try {
      const { error } = await supabase.from('prayer_requests').insert({
        user_id: session.user.id,
        title: newPrayerRequest.title,
        content: newPrayerRequest.content,
        is_anonymous: newPrayerRequest.isAnonymous,
        is_private: newPrayerRequest.isPrivate,
      });

      if (error) throw error;

      toast.success('Prayer request submitted successfully');
      setShowNewPrayerRequest(false);
      setNewPrayerRequest({
        title: '',
        content: '',
        isAnonymous: false,
        isPrivate: false,
      });
      fetchUserData(session.user.id);
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      toast.error('Failed to submit prayer request');
    }
  };

  const handleSubmitTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    try {
      const { error } = await supabase.from('testimonies').insert({
        user_id: session.user.id,
        title: newTestimony.title,
        content: newTestimony.content,
      });

      if (error) throw error;

      toast.success('Testimony submitted successfully');
      setShowNewTestimony(false);
      setNewTestimony({
        title: '',
        content: '',
      });
      fetchUserData(session.user.id);
    } catch (error) {
      console.error('Error submitting testimony:', error);
      toast.error('Failed to submit testimony');
    }
  };

  const handleDeletePrayerRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPrayerRequests(prayerRequests.filter((pr) => pr.id !== id));
      toast.success('Prayer request deleted successfully');
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      toast.error('Failed to delete prayer request');
    }
  };

  const handleDeleteTestimony = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonies(testimonies.filter((t) => t.id !== id));
      toast.success('Testimony deleted successfully');
    } catch (error) {
      console.error('Error deleting testimony:', error);
      toast.error('Failed to delete testimony');
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10 text-center">
              <div className="mb-4">
                <div className="w-24 h-24 rounded-full bg-white shadow-lg mx-auto overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                      <User className="w-12 h-12 text-indigo-600" />
                    </div>
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile?.full_name || profile?.username}
              </h1>
              <p className="text-indigo-100">@{profile?.username}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdateProfile}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <User className="h-5 w-5" />
                        <span className="font-medium">About</span>
                      </div>
                      <p className="text-gray-600">{profile?.bio || 'No bio yet'}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Calendar className="h-5 w-5" />
                        <span className="font-medium">Joined</span>
                      </div>
                      <p className="text-gray-600">
                        {profile?.created_at
                          ? format(new Date(profile.created_at), 'MMMM d, yyyy')
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Prayer Requests & Testimonies */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('prayer')}
                  className={`flex-1 px-6 py-4 text-center ${
                    activeTab === 'prayer'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Prayer Requests</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('testimony')}
                  className={`flex-1 px-6 py-4 text-center ${
                    activeTab === 'testimony'
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Testimonies</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Prayer Requests */}
            {activeTab === 'prayer' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Prayer Requests</h2>
                  <button
                    onClick={() => setShowNewPrayerRequest(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>New Request</span>
                  </button>
                </div>

                {showNewPrayerRequest && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
                    <form onSubmit={handleSubmitPrayerRequest} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newPrayerRequest.title}
                          onChange={(e) =>
                            setNewPrayerRequest({ ...newPrayerRequest, title: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prayer Request
                        </label>
                        <textarea
                          value={newPrayerRequest.content}
                          onChange={(e) =>
                            setNewPrayerRequest({ ...newPrayerRequest, content: e.target.value })
                          }
                          rows={4}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newPrayerRequest.isAnonymous}
                            onChange={(e) =>
                              setNewPrayerRequest({
                                ...newPrayerRequest,
                                isAnonymous: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-600">Submit anonymously</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newPrayerRequest.isPrivate}
                            onChange={(e) =>
                              setNewPrayerRequest({
                                ...newPrayerRequest,
                                isPrivate: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-600">Keep private</span>
                        </label>
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowNewPrayerRequest(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Submit Request
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {prayerRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                            <p className="text-gray-600 mb-4">{request.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(new Date(request.created_at), 'MMM d, yyyy')}
                                </span>
                              </span>
                              {request.isAnonymous && (
                                <span className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>Anonymous</span>
                                </span>
                              )}
                              {request.isPrivate && (
                                <span className="flex items-center space-x-1">
                                  <Shield className="h-4 w-4" />
                                  <span>Private</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePrayerRequest(request.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {prayerRequests.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No prayer requests yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Testimonies */}
            {activeTab === 'testimony' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Testimonies</h2>
                  <button
                    onClick={() => setShowNewTestimony(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>New Testimony</span>
                  </button>
                </div>

                {showNewTestimony && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
                    <form onSubmit={handleSubmitTestimony} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newTestimony.title}
                          onChange={(e) =>
                            setNewTestimony({ ...newTestimony, title: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Testimony
                        </label>
                        <textarea
                          value={newTestimony.content}
                          onChange={(e) =>
                            setNewTestimony({ ...newTestimony, content: e.target.value })
                          }
                          rows={4}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowNewTestimony(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Share Testimony
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {testimonies.map((testimony) => (
                    <div
                      key={testimony.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <h3 className="text-lg font-semibold mb-2">{testimony.title}</h3>
                            <p className="text-gray-600 mb-4">{testimony.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(new Date(testimony.created_at), 'MMM d, yyyy')}
                                </span>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTestimony(testimony.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {testimonies.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No testimonies shared yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}