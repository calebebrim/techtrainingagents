
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, CogIcon, LogoutIcon, MenuIcon } from '../icons';

const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <button onClick={onToggleSidebar} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden">
                    <MenuIcon className="h-6 w-6" />
                </button>
                <div className="relative text-lg font-semibold ml-2 text-gray-800 dark:text-white">
                    Training Platform
                </div>
            </div>

            <div className="flex items-center">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 focus:outline-none">
                        <span className="text-gray-700 dark:text-gray-200 hidden md:block">{user?.name}</span>
                        <img className="h-9 w-9 rounded-full object-cover" src={user?.avatarUrl} alt="User avatar" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 py-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20 border border-gray-200 dark:border-gray-700">
                            <a href="#/account-settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <CogIcon className="w-5 h-5 mr-2"/>
                                Account Settings
                            </a>
                            <button onClick={toggleTheme} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                {theme === 'light' ? <MoonIcon className="w-5 h-5 mr-2" /> : <SunIcon className="w-5 h-5 mr-2" />}
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </button>
                            <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <LogoutIcon className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
