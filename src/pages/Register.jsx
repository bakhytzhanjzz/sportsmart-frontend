import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, User, Mail, Lock, FileText } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Username validation (3-50 characters)
    if (!formData.username) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Максимум 50 символов';
    }

    // Password validation (6-100 characters)
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Максимум 100 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo and Branding */}
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                  <img 
                    src="/src/assets/logo.png" 
                    alt="SportSmart Logo" 
                    className="w-30 h-30 object-contain"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800">
                Создать аккаунт
              </h1>
              <p className="text-slate-600 text-sm">
                Присоединяйтесь к SportSmart
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-4 bg-white border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 ${
                        errors.email ? 'border-rose-300' : 'border-slate-200'
                      }`}
                      placeholder="Email адрес"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.email}</p>}
                </div>

                {/* Username */}
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-4 bg-white border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 ${
                        errors.username ? 'border-rose-300' : 'border-slate-200'
                      }`}
                      placeholder="Имя пользователя"
                      minLength="3"
                      maxLength="50"
                      required
                    />
                  </div>
                  {errors.username && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.username}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-12 py-4 bg-white border rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 ${
                        errors.password ? 'border-rose-300' : 'border-slate-200'
                      }`}
                      placeholder="Пароль"
                      minLength="6"
                      maxLength="100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.password}</p>}
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
                  <span>Создать аккаунт</span>
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

            {/* Login Link */}
            <Link 
              to="/login"
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-2xl hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center transform active:scale-95"
            >
              Уже есть аккаунт? Войти
            </Link>
          </div>

          {/* Terms */}
          <div className="text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Создавая аккаунт, вы соглашаетесь с условиями использования SportSmart
            </p>
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
                <p className="text-slate-400 text-xs">Начните свой фитнес-путь сегодня</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;