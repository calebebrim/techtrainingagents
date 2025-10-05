
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types';
import { SunIcon, MoonIcon, CogIcon, LogoutIcon, MenuIcon, UserGroupIcon, ShieldCheckIcon } from '../icons';
import { getInitials } from '../../utils/avatar';

const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
    const { user, authUser, isImpersonating, startImpersonation, stopImpersonation, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const actingUser = user;
    const realUser = authUser ?? user;
    const canImpersonate = (realUser?.roles.includes(UserRole.SYSTEM_ADMIN)) ?? false;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStartImpersonation = async () => {
        setMenuOpen(false);
        if (typeof window === 'undefined') {
            return;
        }

        const input = window.prompt('Enter the email or ID of the user you want to impersonate:');
        if (!input) {
            return;
        }

        const trimmed = input.trim();
        if (!trimmed) {
            return;
        }

        const payload = trimmed.includes('@') ? { email: trimmed } : { userId: trimmed };

        try {
            await startImpersonation(payload);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to impersonate the requested user.';
            window.alert(message);
        }
    };

    const handleStopImpersonation = async () => {
        setMenuOpen(false);
        try {
            await stopImpersonation();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to stop impersonating right now.';
            if (typeof window !== 'undefined') {
                window.alert(message);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const avatarInitials = getInitials(actingUser?.name);

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <button onClick={onToggleSidebar} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden">
                    <MenuIcon className="h-6 w-6" />
                </button>
                <div className="relative text-lg font-semibold ml-2 text-gray-800 dark:text-white">
                    Training Platform
                </div>
                {isImpersonating && actingUser && (
                    <span className="ml-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                        Impersonating {actingUser.name}
                    </span>
                )}
            </div>

            <div className="flex items-center">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 focus:outline-none">
                        <span className="text-gray-700 dark:text-gray-200 hidden md:block">{actingUser?.name}</span>
                        {actingUser?.avatarUrl ? (
                            <img className="h-9 w-9 rounded-full object-cover" src={actingUser.avatarUrl} alt="User avatar" />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold uppercase" aria-hidden="true">
                                {avatarInitials}
                            </div>
                        )}
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 py-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20 border border-gray-200 dark:border-gray-700">
                            <div className="px-4 pb-2 pt-3 text-xs text-gray-500 dark:text-gray-300">
                                <div className="font-semibold text-gray-700 dark:text-gray-100">{realUser?.name}</div>
                                <div className="truncate">{realUser?.email}</div>
                                {isImpersonating && actingUser && realUser && actingUser.id !== realUser.id && (
                                    <div className="mt-2 rounded bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                                        Acting as {actingUser.name}
                                    </div>
                                )}
                            </div>
                            <a href="#/account-settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <CogIcon className="w-5 h-5 mr-2"/>
                                Account Settings
                            </a>
                            {canImpersonate && (
                                <button
                                    onClick={handleStartImpersonation}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <UserGroupIcon className="w-5 h-5 mr-2" />
                                    {isImpersonating ? 'Switch Impersonation' : 'Impersonate User'}
                                </button>
                            )}
                            {isImpersonating && (
                                <button
                                    onClick={handleStopImpersonation}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                    Stop Impersonating
                                </button>
                            )}
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
