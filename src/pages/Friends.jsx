import { useState, useEffect } from 'react';
import { Heart, Trophy, Calendar, Activity, Check, X, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { friendsAPI } from '../services/friendsapi';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newFriend, setNewFriend] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    loadRequests();
    loadLeaderboard();
  }, [selectedDate]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const res = await friendsAPI.getFriends();
      setFriends(res.data);
    } catch (err) {
      toast.error('Ошибка загрузки списка друзей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await friendsAPI.getRequests();
      setRequests(res.data);
    } catch (err) {
      toast.error('Ошибка загрузки запросов дружбы');
      console.error(err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await friendsAPI.getLeaderboard(selectedDate, 10);
      setLeaderboard(res.data);
    } catch (err) {
      toast.error('Ошибка загрузки рейтинга друзей');
      console.error(err);
    }
  };

  const handleSendRequest = async () => {
    if (!newFriend.trim()) return;
    try {
      await friendsAPI.sendRequest(newFriend.trim());
      toast.success('Запрос отправлен');
      setNewFriend('');
      loadRequests();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Этот пользователь уже добавлен');
      else if (err.response?.status === 404) toast.error('Пользователь не найден');
      else toast.error('Ошибка отправки запроса');
    }
  };

  const handleRespondRequest = async (requestId, accept) => {
    try {
      await friendsAPI.respondRequest(requestId, accept);
      toast.success(accept ? 'Запрос принят' : 'Запрос отклонен');
      loadFriends();
      loadRequests();
    } catch (err) {
      toast.error('Ошибка обработки запроса');
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-slate-400" />;
    if (index === 2) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-600">{index + 1}</span>;
  };

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
          <h1 className="text-2xl font-bold text-slate-800">Друзья</h1>
          <p className="text-sm text-slate-600 mt-1">Соревнуйтесь с друзьями</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Friend */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3 mb-3">
          <UserPlus className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-800">Добавить друга</h2>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={handleSendRequest}
            className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Friend Requests */}
      {requests.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Запросы в друзья</span>
          </h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">{req.sender}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRespondRequest(req.id, true)}
                    className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleRespondRequest(req.id, false)}
                    className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Рейтинг друзей</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: ru })}
          </p>
        </div>

        {leaderboard.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {leaderboard.map((friend, index) => (
              <div key={friend.username} className={`flex items-center justify-between p-4 border-b border-slate-50 last:border-b-0 ${
                index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50' :
                index === 1 ? 'bg-gradient-to-r from-slate-50 to-slate-100' :
                index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 
                'hover:bg-slate-50'
              } transition-colors`}>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      index === 0 ? 'bg-amber-200 text-amber-800' :
                      index === 1 ? 'bg-slate-200 text-slate-800' :
                      index === 2 ? 'bg-orange-200 text-orange-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">{friend.username}</h3>
                      <p className="text-xs text-slate-500">#{index + 1} место</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-800 text-sm">
                      {friend.steps.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">шагов</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-medium text-slate-800 mb-2">Нет друзей</h3>
            <p className="text-sm text-slate-600">Добавьте друзей, чтобы видеть их активность</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {leaderboard.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-xs font-medium">ВСЕГО ДРУЗЕЙ</p>
              <p className="text-2xl font-bold">{leaderboard.length}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-xs font-medium">ЛУЧШИЙ РЕЗУЛЬТАТ</p>
              <p className="text-2xl font-bold text-amber-400">
                {leaderboard[0]?.steps.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;