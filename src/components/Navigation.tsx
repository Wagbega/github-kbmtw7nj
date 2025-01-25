import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Church, Video, Calendar, Archive, Menu, X, User, MessageCircle } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { 
      to: '/', 
      label: 'Home', 
      icon: Church,
      description: 'Welcome to our church community'
    },
    { 
      to: '/live', 
      label: 'Live Stream', 
      icon: Video,
      description: 'Watch our services live'
    },
    { 
      to: '/events', 
      label: 'Events', 
      icon: Calendar,
      description: 'Upcoming church events and activities'
    },
    { 
      to: '/archive', 
      label: 'Archive', 
      icon: Archive,
      description: 'Past services and sermons'
    },
    { 
      to: '/prayer-wall', 
      label: 'Prayer Wall', 
      icon: MessageCircle,
      description: 'Share and join in prayer'
    },
    { 
      to: '/profile', 
      label: 'Profile', 
      icon: User,
      description: 'Manage your account'
    },
  ];

  const handleNavClick = (to: string) => {
    setIsOpen(false);
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              onClick={() => handleNavClick('/')}
            >
              <img 
                src="https://res.cloudinary.com/softcraft/image/upload/v1737808299/SACRED_LOGO_034534_uoasan.png" 
                alt="Church Logo" 
                className="h-8 w-8 rounded-full"
              />
              <span className="font-bold text-xl text-gray-900">Idasa Model Parish</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ to, label, icon: Icon, description }) => (
              <Link
                key={to}
                to={to}
                onClick={() => handleNavClick(to)}
                className="group relative flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg mt-2 whitespace-nowrap">
                    {description}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-indigo-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, description }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                onClick={() => handleNavClick(to)}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-500">{description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}