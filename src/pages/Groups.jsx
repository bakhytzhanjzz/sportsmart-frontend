import { useState, useEffect } from 'react';
import { Plus, Users, Trophy, UserPlus, Calendar, Activity, Trash2, Check, X } from 'lucide-react';
import { groupsAPI, stepsAPI } from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '', isPrivate: false });
  const [inviteUsername, setInviteUsername] = useState('');

  // Invitations
  const [invitations, setInvitations] = useState([]);

  /** ---------------------- EFFECTS ---------------------- */
  useEffect(() => {
    loadGroups();
    loadInvitations();
  }, []);

  useEffect(() => {
    if (selectedGroup) loadGroupLeaderboard();
  }, [selectedGroup, selectedDate]);

  /** ---------------------- API LOADERS ---------------------- */
  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await groupsAPI.getGroups();
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroup) setSelectedGroup(res.data[0]);
    } catch (error) {
      toast.error('Ошибка загрузки групп');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupLeaderboard = async () => {
    if (!selectedGroup) return;
    try {
      const res = await stepsAPI.getGroupLeaderboard(selectedGroup.id, selectedDate, 10);
      setGroupLeaderboard(res.data);
    } catch (error) {
      toast.error('Ошибка загрузки рейтинга группы');
      console.error(error);
    }
  };

  const loadInvitations = async () => {
    try {
      const res = await groupsAPI.getInvitations();
      setInvitations(res.data);
    } catch (error) {
      toast.error('Ошибка загрузки приглашений');
      console.error(error);
    }
  };

  /** ---------------------- HANDLERS ---------------------- */
  const handleInvitation = async (inviteId, accept) => {
    try {
      await groupsAPI.respondToInvitation(inviteId, accept);
      toast.success(accept ? 'Вы приняли приглашение!' : 'Вы отклонили приглашение');
      loadGroups();
      loadInvitations();
    } catch (error) {
      toast.error('Ошибка обработки приглашения');
      console.error(error);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupData.name.trim()) return;
    try {
      const res = await groupsAPI.createGroup(newGroupData);
      setGroups([...groups, res.data]);
      setSelectedGroup(res.data);
      setNewGroupData({ name: '', description: '', isPrivate: false });
      setShowCreateForm(false);
      toast.success('Группа создана успешно!');
    } catch (error) {
      toast.error('Ошибка создания группы');
      console.error(error);
    }
  };

  const inviteToGroup = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim() || !selectedGroup) return;
    try {
      await groupsAPI.inviteToGroup(selectedGroup.id, inviteUsername);
      setInviteUsername('');
      setShowInviteForm(false);
      toast.success('Приглашение отправлено!');
    } catch (error) {
      toast.error('Ошибка отправки приглашения');
      console.error(error);
    }
  };

  const leaveGroup = async (groupId) => {
    if (!confirm('Вы точно хотите покинуть группу?')) return;
    try {
      await groupsAPI.leaveGroup(groupId);
      setGroups(groups.filter((g) => g.id !== groupId));
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
      toast.success('Вы покинули группу');
    } catch (error) {
      toast.error('Ошибка выхода из группы');
      console.error(error);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!confirm('Вы точно хотите удалить группу?')) return;
    try {
      await groupsAPI.deleteGroup(groupId);
      setGroups(groups.filter((g) => g.id !== groupId));
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
      toast.success('Группа удалена');
    } catch (error) {
      toast.error('Ошибка удаления группы');
      console.error(error);
    }
  };

  /** ---------------------- RANK ICON ---------------------- */
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

  /** ---------------------- JSX ---------------------- */
  return (
    <div className="space-y-4 max-w-md mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Группы</h1>
          <p className="text-sm text-slate-600 mt-1">Соревнования и командная работа</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium shadow-lg"
        >
          <Plus className="w-4 h-4 mr-1" />
          Создать
        </button>
      </div>

      {/* Invitations */}
      {invitations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Приглашения в группы</span>
          </h3>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-800">"{inv.groupName}"</p>
                  <p className="text-xs text-slate-600">от {inv.inviter}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInvitation(inv.id, true)}
                    className="p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleInvitation(inv.id, false)}
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

      {/* Groups List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-slate-600" />
            <span>Мои группы</span>
          </h2>
        </div>

        {groups.length > 0 ? (
          <div className="max-h-48 overflow-y-auto">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center justify-between p-4 border-b border-slate-50 last:border-b-0 cursor-pointer transition-colors ${
                  selectedGroup?.id === group.id ? 'bg-amber-50 border-l-4 border-amber-500' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedGroup?.id === group.id ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    <Users className={`w-5 h-5 ${
                      selectedGroup?.id === group.id ? 'text-amber-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 text-sm">{group.name}</h3>
                    <p className="text-xs text-slate-500">ID: {group.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); leaveGroup(group.id); }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-medium text-slate-800 mb-2">Нет групп</h3>
            <p className="text-sm text-slate-600">Создайте или присоединитесь к группе</p>
          </div>
        )}
      </div>

      {/* Selected Group Details */}
      {selectedGroup && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800 text-lg">{selectedGroup.name}</h2>
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center px-3 py-1.5 text-xs bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-colors"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Пригласить
              </button>
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

          {/* Group Leaderboard */}
          <div className="p-4">
            <h3 className="font-medium text-slate-800 mb-3 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Рейтинг группы</span>
            </h3>

            {groupLeaderboard.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {groupLeaderboard.map((member, idx) => (
                  <div key={member.username} className={`flex items-center justify-between p-3 rounded-lg ${
                    idx === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50' :
                    idx === 1 ? 'bg-gradient-to-r from-slate-50 to-slate-100' :
                    idx === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 
                    'bg-slate-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6">
                        {getRankIcon(idx)}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        idx === 0 ? 'bg-amber-200 text-amber-800' :
                        idx === 1 ? 'bg-slate-200 text-slate-800' :
                        idx === 2 ? 'bg-orange-200 text-orange-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800 text-sm">{member.username}</h4>
                        <p className="text-xs text-slate-500">#{idx + 1} место</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-slate-800 text-sm">
                          {member.steps.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">шагов</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Нет активности на выбранную дату</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {selectedGroup && groupLeaderboard.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-xs font-medium">УЧАСТНИКОВ</p>
              <p className="text-2xl font-bold">{groupLeaderboard.length}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-xs font-medium">ЛУЧШИЙ РЕЗУЛЬТАТ</p>
              <p className="text-2xl font-bold text-amber-400">
                {groupLeaderboard[0]?.steps.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----- CREATE & INVITE MODALS ----- */}
      {showCreateForm && (
        <Modal title="Создать новую группу" onClose={() => setShowCreateForm(false)}>
          <CreateGroupForm data={newGroupData} setData={setNewGroupData} onSubmit={createGroup} />
        </Modal>
      )}
      {showInviteForm && selectedGroup && (
        <Modal title={`Пригласить в "${selectedGroup.name}"`} onClose={() => setShowInviteForm(false)}>
          <InviteForm username={inviteUsername} setUsername={setInviteUsername} onSubmit={inviteToGroup} />
        </Modal>
      )}
    </div>
  );
};

/** ---------------------- MODAL COMPONENT ---------------------- */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

/** ---------------------- FORMS ---------------------- */
const CreateGroupForm = ({ data, setData, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <input
      type="text"
      placeholder="Название группы"
      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
      value={data.name}
      onChange={(e) => setData({ ...data, name: e.target.value })}
      required
    />
    <input
      type="text"
      placeholder="Описание (опционально)"
      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
      value={data.description}
      onChange={(e) => setData({ ...data, description: e.target.value })}
    />
    <label className="flex items-center space-x-3">
      <input
        type="checkbox"
        checked={data.isPrivate}
        onChange={(e) => setData({ ...data, isPrivate: e.target.checked })}
        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
      />
      <span className="text-sm text-slate-700">Приватная группа</span>
    </label>
    <button 
      type="submit" 
      className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
    >
      Создать группу
    </button>
  </form>
);

const InviteForm = ({ username, setUsername, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <input
      type="text"
      placeholder="Имя пользователя"
      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <button 
      type="submit" 
      className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
    >
      Отправить приглашение
    </button>
  </form>
);

export default Groups;