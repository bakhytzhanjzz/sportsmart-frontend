import { NavLink } from 'react-router-dom';
import { Home, Users, Heart, User, LogOut, Activity } from 'lucide-react';

import { useAuth } from '../store/AuthContext';

const Layout = ({ children }) => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Главная' },
    { path: '/friends', icon: Heart, label: 'Друзья' },
    { path: '/groups', icon: Users, label: 'Группы' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">SportSmart</h1>
                <p className="text-xs text-slate-600">Ваш фитнес-трекер</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pb-20">
        <main className="py-6">
          {children}
        </main>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-20">
        <div className="max-w-md mx-auto">
          <nav className="flex">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-3 px-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-full mb-1 transition-colors ${
                      isActive 
                        ? 'bg-amber-100' 
                        : 'group-hover:bg-slate-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-amber-600' : 'text-current'
                      }`} />
                    </div>
                    <span className="leading-none">{label}</span>
                    {isActive && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-amber-600 rounded-full"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;