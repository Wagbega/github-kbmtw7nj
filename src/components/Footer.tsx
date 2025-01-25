import React, { useState } from 'react';
import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube, Send, MapPin, Globe, Share2 } from 'lucide-react';

const serviceTimesStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  padding: '0.25rem 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simple success message without toast
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = 'Join us at Idasa Model Parish';

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      lines: [
        'U41 Adelegan Ojo Omole Way, Idasa Street',
        'Ilesa, Osun State, Nigeria',
        'Landmark: Near Central Market'
      ]
    },
    {
      icon: Phone,
      title: 'Call Us',
      lines: [
        '+234 803 817 0800 - (Secretary)',
        '+234 814 294 6722 - (IT Dept)',
        '+234 903 518 1087 - (IT Dept)'
      ]
    },
    {
      icon: Mail,
      title: 'Email Us',
      lines: [
        'info@idasamodelparish.org',
        'prayer@idasamodelparish.org',
        'support@idasamodelparish.org'
      ]
    },
    {
      icon: Globe,
      title: 'Office Hours',
      lines: [
        'Monday - Friday: 9:00 AM - 5:00 PM',
        'Saturday: 10:00 AM - 2:00 PM'
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Youtube, href: '#', label: 'Youtube', color: 'hover:text-red-600' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Contact Us
            </h2>
            <div className="grid gap-6">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors cursor-pointer group"
                  onMouseEnter={() => setIsHovered(item.title)}
                  onMouseLeave={() => setIsHovered('')}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                    isHovered === item.title ? 'text-indigo-400' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Service Times
            </h2>
            <div className="space-y-6">
              <div className="p-4 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="w-full">
                    <h3 className="font-semibold mb-3">Weekly Services</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div style={serviceTimesStyle}>
                        <span>Sunday Bible Study</span>
                        <span>9:00 AM</span>
                      </div>
                      <div style={serviceTimesStyle}>
                        <span>Sunday Main Service</span>
                        <span>10:00 AM</span>
                      </div>
                      <div style={serviceTimesStyle}>
                        <span>Wednesday Service</span>
                        <span>9:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="w-full">
                    <h3 className="font-semibold mb-3">Special Services</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div style={serviceTimesStyle}>
                        <span>Last Wednesday</span>
                        <span>9:00 AM</span>
                      </div>
                      <div style={serviceTimesStyle}>
                        <span>First Saturday Youth Prayer</span>
                        <span>6:30 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Connected */}
          <div>
            <div className="bg-white bg-opacity-5 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Stay Connected</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 hover:bg-white hover:bg-opacity-5 rounded-full transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-2 z-50">
                      <div className="flex flex-col space-y-2 min-w-[200px]">
                        <button 
                          onClick={() => {
                            window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
                            setShowShareMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Facebook className="h-5 w-5 text-blue-600" />
                          <span>Share on Facebook</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`);
                            setShowShareMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Twitter className="h-5 w-5 text-blue-400" />
                          <span>Share on Twitter</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`);
                            setShowShareMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <span className="text-green-500 text-xl">📱</span>
                          <span>Share on WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-6">
                Join our community and stay updated with the latest events, sermons, and announcements.
              </p>

              <form onSubmit={handleSubmit} className="mb-6">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>

              <div className="flex justify-center space-x-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <social.icon className={`h-6 w-6 text-gray-400 ${social.color}`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Idasa Model Parish, Powered By Media Dept. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}