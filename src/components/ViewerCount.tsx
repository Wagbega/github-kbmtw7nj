import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { streamService } from '../services/streamService';

interface Props {
  streamId: string;
}

export default function ViewerCount({ streamId }: Props) {
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    const updateViewerCount = async () => {
      const count = await streamService.getViewerCount(streamId);
      setViewerCount(count);
    };

    // Update initially and every 10 seconds
    updateViewerCount();
    const interval = setInterval(updateViewerCount, 10000);

    return () => clearInterval(interval);
  }, [streamId]);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <Users className="h-4 w-4" />
      <span>{viewerCount} watching</span>
    </div>
  );
}