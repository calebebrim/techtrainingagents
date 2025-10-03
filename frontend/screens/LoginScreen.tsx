
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import { GoogleIcon, GithubIcon } from '../components/icons';
import Modal from '../components/common/Modal';

const LoginScreen: React.FC = () => {
    const { login } = useAuth();
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

    const handleLogin = () => {
        // This is a mock login. In a real app, this would involve a popup/redirect
        // and a callback with the user's data from the provider.
        const mockUserData: User = {
            id: 'user-1',
            name: 'Admin User',
            email: 'admin@example.com',
            avatarUrl: 'https://picsum.photos/seed/user1/100/100',
            roles: [UserRole.SYSTEM_ADMIN, UserRole.ADMIN, UserRole.COURSE_COORDINATOR, UserRole.TECHNICAL_STAFF],
            organizationId: 'org-1'
        };
        login(mockUserData);
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to continue to the platform.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <GoogleIcon className="w-5 h-5 mr-3" />
                            Sign in with Google
                        </button>
                        <button
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <GithubIcon className="w-5 h-5 mr-3" />
                            Sign in with GitHub
                        </button>
                    </div>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        New to our platform?{' '}
                        <button onClick={() => setRegisterModalOpen(true)} className="font-medium text-primary-600 hover:text-primary-500">
                            Create an Organization
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} title="Register New Organization">
                <form className="space-y-4">
                    <div>
                        <label htmlFor="org-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Administrator's Institutional Email</label>
                        <input type="email" id="org-email" placeholder="admin@mycompany.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                        <input type="text" id="cnpj" placeholder="00.000.000/0001-00" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Information</label>
                        <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md">
                            {/* In a real app, this would be a Stripe/Braintree element */}
                             <div className="space-y-2">
                                <input type="text" placeholder="Card Number" className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                                <div className="flex space-x-2">
                                    <input type="text" placeholder="MM / YY" className="block w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                                    <input type="text" placeholder="CVC" className="block w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2">
                         <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                           Complete Registration
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default LoginScreen;