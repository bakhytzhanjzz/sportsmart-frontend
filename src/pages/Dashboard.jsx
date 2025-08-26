import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Calendar, Upload } from 'lucide-react';
import { stepsAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [todaySteps, setTodaySteps] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные за сегодня
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyResponse = await stepsAPI.getDailySteps(today, today);
      
      if (dailyResponse.data.length > 0) {
        setTodaySteps(dailyResponse.data[0].stepsTotal);
      }

      // Получаем историю за 7 дней
      const historyResponse = await stepsAPI.getHistory(7);
      const formattedData = historyResponse.data.map(item => ({
        date: format(new Date(item.date), 'dd MMM', { locale: ru }),
        steps: item.stepsTotal,
        fullDate: item.date
      }));
      
      setWeeklyData(formattedData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadMockSteps = async () => {
    try {
      setUploading(true);
      const mockData = {
        provider: "MOCK",
        deviceId: "demo-device-1",
        samples: [
          {
            externalId: `batch-${Date.now()}`,
            startedAt: new Date().toISOString(),
            endedAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            steps: Math.floor(Math.random() * 500) + 100,
            source: "mock-app-v1"
          }
        ]
      };

      await stepsAPI.uploadSteps(mockData, crypto.randomUUID());
      toast.success('Шаги успешно добавлены!');
      await loadDashboardData();
    } catch (error) {
      toast.error('Ошибка загрузки шагов');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.steps, 0);
  const weeklyAverage = weeklyData.length > 0 ? Math.round(weeklyTotal / weeklyData.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-amber-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Главная</h1>
          <p className="text-sm text-slate-600 mt-1">Ваша активность сегодня</p>
        </div>
        <button
          onClick={uploadMockSteps}
          disabled={uploading}
          className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm font-medium shadow-lg"
        >
          <Upload className="w-4 h-4 mr-1" />
          {uploading ? 'Загрузка...' : 'Добавить'}
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-500 bg-opacity-20 rounded-full">
            <Activity className="w-8 h-8 text-amber-400" />
          </div>
          <div className="text-right">
            <p className="text-amber-400 text-sm font-medium">ШАГИ СЕГОДНЯ</p>
            <p className="text-3xl font-bold mt-1">
              {todaySteps.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((todaySteps / 10000) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-slate-300 text-xs mt-2">
          Цель: 10,000 шагов ({Math.round((todaySteps / 10000) * 100)}% выполнено)
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-600 text-xs font-medium">За неделю</p>
              <p className="text-lg font-bold text-slate-800">
                {(weeklyTotal / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-600 text-xs font-medium">Среднее</p>
              <p className="text-lg font-bold text-slate-800">
                {(weeklyAverage / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Активность за неделю</h2>
        
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={11}
                tickMargin={8}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(value) => `${Math.round(value/1000)}k`}
                width={35}
              />
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), 'Шаги']}
                labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="steps" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fbbf24' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-500">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Нет данных</p>
              <p className="text-xs mt-1 text-slate-400">Добавьте шаги для просмотра статистики</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        <button className="bg-white border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Установить цель</p>
              <p className="text-sm text-slate-600">Настройте ежедневную цель</p>
            </div>
            <div className="text-amber-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;