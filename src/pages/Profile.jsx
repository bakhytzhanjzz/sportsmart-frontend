"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Settings, Globe, Save, LogOut, Edit3, Camera, Trophy, Calendar, Activity } from "lucide-react"
import { useAuth } from "../store/AuthContext"
import { profileAPI } from "../services/profileapi"
import toast from "react-hot-toast"

const Profile = () => {
  const { user, setUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    avatarUrl: "",
    timezone: "Asia/Almaty",
  })
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const timezones = [
    "Asia/Almaty",
    "Europe/Moscow",
    "Asia/Yekaterinburg",
    "Asia/Novosibirsk",
    "Asia/Krasnoyarsk",
    "Asia/Irkutsk",
    "Europe/Kiev",
    "Europe/Minsk",
  ]

  const loadProfile = useCallback(async () => {
    if (!user || profileLoaded) return

    try {
      setLoading(true)
      const res = await profileAPI.getMe()
      setFormData({
        fullName: res.data.fullName || "",
        avatarUrl: res.data.avatarUrl || "",
        timezone: res.data.timezone || "Asia/Almaty",
      })
      setUser(res.data)
      setProfileLoaded(true)
    } catch (err) {
      toast.error("Ошибка загрузки профиля")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user, setUser, profileLoaded])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const res = await profileAPI.updateProfile(formData)
      const updatedData = {
        fullName: res.data.fullName || "",
        avatarUrl: res.data.avatarUrl || "",
        timezone: res.data.timezone || "Asia/Almaty",
      }
      setFormData(updatedData)
      setUser(res.data)
      setIsEditing(false)
      toast.success("Профиль обновлен успешно!")
    } catch (err) {
      toast.error("Ошибка обновления профиля")
      console.error(err)
    }
  }

  const handleCancel = useCallback(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        avatarUrl: user.avatarUrl || "",
        timezone: user.timezone || "Asia/Almaty",
      })
    }
    setIsEditing(false)
  }, [user])

  const handleLogout = useCallback(() => {
    if (confirm("Вы уверены, что хотите выйти?")) {
      logout()
    }
  }, [logout])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-amber-600 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Профиль</h1>
          <p className="text-sm text-slate-600 mt-1">Управление аккаунтом</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium shadow-lg"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          {isEditing ? 'Готово' : 'Изменить'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-amber-500 bg-opacity-20 rounded-full flex items-center justify-center">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-amber-400" />
              )}
            </div>
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 p-2 bg-amber-500 rounded-full">
                <Camera className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {formData.fullName || user?.username || "Пользователь"}
            </h2>
            <div className="flex items-center space-x-2 text-amber-400 text-sm">
              <Globe className="w-4 h-4" />
              <span>{formData.timezone}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-300 text-sm">@{user?.username}</p>
        </div>
      </div>



      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Редактировать профиль</h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Полное имя
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Введите полное имя"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Аватар (URL)
              </label>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ссылка на изображение"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Временная зона
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <button className="w-full bg-white border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Настройки приложения</p>
                <p className="text-sm text-slate-600">Уведомления и предпочтения</p>
              </div>
            </div>
            <div className="text-amber-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Logout Section */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти из аккаунта</span>
        </button>
        <p className="text-xs text-red-600 text-center mt-2">
          Завершить текущий сеанс работы
        </p>
      </div>
    </div>
  )
}

export default Profile