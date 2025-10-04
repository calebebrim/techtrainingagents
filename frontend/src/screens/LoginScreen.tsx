
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon, GithubIcon } from '../components/icons';
import Modal from '../components/common/Modal';
import './LoginScreen.css';

const LoginScreen: React.FC = () => {
    const { login, loading } = useAuth();
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            setErrorMessage(null);
            await login();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to sign in with Google right now.';
            setErrorMessage(message);
        }
    };

    return (
        <>
            <div className="login-shell min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0B1623] dark:via-[#0B1623] dark:to-[#09111B]">
                <div className="login-grid grid min-h-screen grid-cols-1 lg:grid-cols-12">
                    <aside className="login-hero relative hidden lg:flex lg:col-span-5 xl:col-span-6 overflow-hidden bg-primary-600/90 dark:bg-primary-700/70">
                        <div className="login-hero__glow absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
                        <div className="relative z-10 flex flex-col justify-between px-12 py-16 text-white">
                            <div>
                                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide backdrop-blur-sm">
                                    Powered learning
                                </span>
                                <h1 className="mt-6 text-4xl font-semibold leading-tight xl:text-5xl">
                                    Upskill your teams with an AI curated academy.
                                </h1>
                                <p className="mt-4 max-w-md text-base text-white/85">
                                    Offer tailored learning journeys, monitor progress in real time, and accelerate performance across every organization that runs on your platform.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                                        <span className="text-lg font-semibold">01</span>
                                    </div>
                                    <p className="text-sm text-white/80">Centralize academy management for every client organization.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                                        <span className="text-lg font-semibold">02</span>
                                    </div>
                                    <p className="text-sm text-white/80">Deliver insights with dashboards calibrated for leaders and admins.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                                        <span className="text-lg font-semibold">03</span>
                                    </div>
                                    <p className="text-sm text-white/80">Switch themes instantly to match each brand&rsquo;s look and feel.</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 bottom-[-10%] h-[420px] w-[420px] rounded-full bg-white/20 blur-3xl" />
                    </aside>

                    <section className="login-panel flex items-center justify-center px-6 py-12 sm:px-10 lg:col-span-7 xl:col-span-6">
                        <div className="login-panel__content w-full max-w-md space-y-10">
                            <div>
                                <span className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Welcome back</span>
                                <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Sign in to continue</h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Choose your provider to access your organization workspace.
                                </p>
                            </div>

                            <div className="login-card rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
                                <div className="space-y-4">
                                    {errorMessage && (
                                        <div
                                            role="alert"
                                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-200"
                                        >
                                            {errorMessage}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="provider-btn provider-btn--google w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:-translate-y-[1px] hover:border-primary-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary-400"
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <GoogleIcon className="h-6 w-6" />
                                            <span>{loading ? 'Signing you in…' : 'Sign in with Google'}</span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="provider-btn provider-btn--github w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:-translate-y-[1px] hover:border-gray-900 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-400"
                                        title="GitHub authentication is coming soon"
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <GithubIcon className="h-6 w-6" />
                                            <span>{loading ? 'Signing you in…' : 'Sign in with GitHub'}</span>
                                        </span>
                                    </button>
                                </div>

                                <div className="mt-8 flex flex-col items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                                        Organizations</div>
                                    <p className="text-center text-sm">
                                        New to the platform?{' '}
                                        <button
                                            onClick={() => setRegisterModalOpen(true)}
                                            className="font-semibold text-primary-600 transition hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                                        >
                                            Create an organization
                                        </button>
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                By continuing, you agree to our Terms of Service and acknowledge you have read our Privacy Policy.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <Modal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} title="Register New Organization">
                <form className="space-y-4">
                    <div>
                        <label htmlFor="org-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Administrator's Institutional Email</label>
                        <input type="email" id="org-email" placeholder="admin@mycompany.com" className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                        <input type="text" id="cnpj" placeholder="00.000.000/0001-00" className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Information</label>
                        <div className="mt-1 rounded-md border border-gray-300 p-3 dark:border-gray-600">
                            {/* In a real app, this would be a Stripe/Braintree element */}
                            <div className="space-y-2">
                                <input type="text" placeholder="Card Number" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
                                <div className="flex gap-2">
                                    <input type="text" placeholder="MM / YY" className="block w-1/2 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
                                    <input type="text" placeholder="CVC" className="block w-1/2 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                            Complete Registration
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default LoginScreen;
