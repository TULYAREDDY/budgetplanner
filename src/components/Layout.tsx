import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/weekly-tracker', label: 'Weekly Tracker', icon: <Calendar size={20} /> },
    { path: '/emi-planner', label: 'EMI Planner', icon: <CreditCard size={20} /> },
    { path: '/monthly-report', label: 'Monthly Report', icon: <BarChart3 size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Budget Buddy</h1>
        </div>
        <div className="flex flex-col flex-grow p-4">
          <div className="mb-8">
            <p className="text-sm text-gray-500">Welcome,</p>
            <p className="font-medium">{currentUser?.name}</p>
          </div>
          <nav className="flex-grow">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center p-3 mt-auto text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-grow">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold text-primary">Budget Buddy</h1>
          <button onClick={toggleMobileMenu} className="p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white p-4 md:hidden">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-primary">Budget Buddy</h1>
              <button onClick={toggleMobileMenu} className="p-2">
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">Welcome,</p>
              <p className="font-medium">{currentUser?.name}</p>
            </div>
            <nav>
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                        toggleMobileMenu();
                      }}
                      className={`flex items-center p-3 rounded-lg ${
                        location.pathname === item.path
                          ? 'bg-primary text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="flex items-center w-full p-3 text-gray-700 rounded-lg"
                  >
                    <LogOut size={20} />
                    <span className="ml-3">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;