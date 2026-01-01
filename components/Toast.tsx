
import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification && !isVisible) return null;

  const getIcon = () => {
    switch (notification?.type) {
      case 'success': return <CheckCircle size={20} className="text-green-400" />;
      case 'warning': return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'error': return <XCircle size={20} className="text-red-400" />;
      default: return <Info size={20} className="text-blue-400" />;
    }
  };

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[150] transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
      <div className="bg-[#12162A]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 pr-10 flex items-center gap-3 min-w-[300px] max-w-sm">
        {getIcon()}
        <div>
          <h4 className="text-sm font-bold text-white leading-none mb-1">{notification?.title}</h4>
          <p className="text-xs text-gray-300 leading-none">{notification?.message}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
