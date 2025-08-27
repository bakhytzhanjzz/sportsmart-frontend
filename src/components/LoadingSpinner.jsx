import { Activity } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-12 h-12 text-amber-600 animate-pulse mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Загрузка...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;