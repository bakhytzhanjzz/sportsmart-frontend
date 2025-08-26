import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo and Branding */}
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100">
                  <img 
                    src="/src/assets/logo.png" 
                    alt="SportSmart Logo" 
                    className="w-30 h-30 object-contain"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-800">
                SportSmart
              </h1>
              <p className="text-slate-600 text-sm">
                Ваш персональный фитнес-трекер
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
                    placeholder="Имя пользователя или email"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12 transition-all text-slate-800 placeholder-slate-400"
                    placeholder="Пароль"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 px-6 rounded-2xl hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transform active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Войти в аккаунт</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500">или</span>
              </div>
            </div>

            {/* Register Link */}
            <Link 
              to="/register"
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-2xl hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center transform active:scale-95"
            >
              Создать новый аккаунт
            </Link>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
              <span>Безопасный вход</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span>Защита данных</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="px-4 pb-6">
        <div className="max-w-sm mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-semibold">SportSmart</p>
                <p className="text-slate-400 text-xs">Отслеживайте прогресс каждый день</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;