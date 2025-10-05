
import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { GoogleIcon, GithubIcon } from '../components/icons';
import Modal from '../components/common/Modal';
import './LoginScreen.css';
import { CountryCode, formatIdentifier, identifierMetaByCountry } from '../utils/organizationIdentifier';
import { useTranslation } from 'react-i18next';

const LoginScreen: React.FC = () => {
    const { login, loading } = useAuth();
    const { showNotification } = useNotifications();
    const { t } = useTranslation();
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [registerCountry, setRegisterCountry] = useState<CountryCode>('BR');
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [governmentId, setGovernmentId] = useState('');

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 19);
        const parts = digits.match(/.{1,4}/g) ?? [];
        return parts.join(' ');
    };

    const formatCardExpiry = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length === 0) {
            return '';
        }
        if (digits.length <= 2) {
            return digits;
        }
        return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    };

    const formatCardCvc = (value: string) => value.replace(/\D/g, '').slice(0, 4);

    const identifierMeta = useMemo(() => identifierMetaByCountry[registerCountry], [registerCountry]);

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            const fallbackMessage = t('login.errors.googleLogin');
            const message = error instanceof Error && error.message ? error.message : fallbackMessage;
            showNotification({
                title: t('login.errors.title'),
                message,
                type: 'error',
                duration: 7000
            });
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
                                    {t('login.hero.badge')}
                                </span>
                                <h1 className="mt-6 text-4xl font-semibold leading-tight xl:text-5xl">
                                    {t('login.hero.title')}
                                </h1>
                                <p className="mt-4 max-w-md text-base text-white/85">
                                    {t('login.hero.description')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                                        <span className="text-lg font-semibold">01</span>
                                    </div>
                                    <p className="text-sm text-white/80">{t('login.hero.bullets.centralize')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                                        <span className="text-lg font-semibold">02</span>
                                    </div>
                                    <p className="text-sm text-white/80">{t('login.hero.bullets.insights')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                                        <span className="text-lg font-semibold">03</span>
                                    </div>
                                    <p className="text-sm text-white/80">{t('login.hero.bullets.themes')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 bottom-[-10%] h-[420px] w-[420px] rounded-full bg-white/20 blur-3xl" />
                    </aside>

                    <section className="login-panel flex items-center justify-center px-6 py-12 sm:px-10 lg:col-span-7 xl:col-span-6">
                        <div className="login-panel__content w-full max-w-md space-y-10">
                            <div>
                                <span className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">{t('login.panel.welcome')}</span>
                                <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{t('login.panel.title')}</h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {t('login.panel.description')}
                                </p>
                            </div>

                            <div className="login-card rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
                                <div className="space-y-4">
                                    <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="provider-btn provider-btn--google w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:-translate-y-[1px] hover:border-primary-500 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary-400"
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <GoogleIcon className="h-6 w-6" />
                                            <span>{loading ? t('login.panel.signingIn') : t('login.panel.googleLabel')}</span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="provider-btn provider-btn--github w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:-translate-y-[1px] hover:border-gray-900 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-400"
                                        title={t('login.panel.githubTooltip')}
                                    >
                                        <span className="flex items-center justify-center gap-3">
                                            <GithubIcon className="h-6 w-6" />
                                            <span>{loading ? t('login.panel.signingIn') : t('login.panel.githubLabel')}</span>
                                        </span>
                                    </button>
                                </div>

                                <div className="mt-8 flex flex-col items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                                        {t('login.panel.organizationsTag')}</div>
                                    <p className="text-center text-sm">
                                        {t('login.panel.newToPlatform')}{' '}
                                        <button
                                            onClick={() => setRegisterModalOpen(true)}
                                            className="font-semibold text-primary-600 transition hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                                        >
                                            {t('login.panel.createOrganization')}
                                        </button>
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                {t('login.panel.terms')}
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <Modal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} title={t('login.modal.title')}>
                <form className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.modal.companyName')}</label>
                            <input
                                type="text"
                                id="company-name"
                                value={companyName}
                                onChange={event => setCompanyName(event.target.value)}
                                placeholder={t('login.modal.companyPlaceholder')}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                        </div>
                        <div>
                            <label htmlFor="register-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.modal.country')}</label>
                            <select
                                id="register-country"
                                value={registerCountry}
                                onChange={event => {
                                    const next = event.target.value as CountryCode;
                                    setRegisterCountry(next);
                                    setGovernmentId(current => formatIdentifier(next, current));
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            >
                                <option value="BR">{t('login.modal.countryOptions.br')}</option>
                                <option value="US">{t('login.modal.countryOptions.us')}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="org-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.modal.adminEmail')}</label>
                        <input type="email" id="org-email" placeholder="admin@mycompany.com" className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label htmlFor="government-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{identifierMeta.label}</label>
                        <input
                            type="text"
                            id="government-id"
                            value={governmentId}
                            onChange={event => setGovernmentId(formatIdentifier(registerCountry, event.target.value))}
                            placeholder={identifierMeta.placeholder}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label htmlFor="org-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.modal.address')}</label>
                        <textarea
                            id="org-address"
                            value={companyAddress}
                            onChange={event => setCompanyAddress(event.target.value)}
                            rows={3}
                            placeholder={t('login.modal.addressPlaceholder')}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('login.modal.paymentInfo')}</label>
                        <div className="mt-1 rounded-md border border-gray-300 p-3 dark:border-gray-600">
                            {/* In a real app, this would be a Stripe/Braintree element */}
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder={t('login.modal.cardNumber')}
                                    value={cardNumber}
                                    onChange={event => setCardNumber(formatCardNumber(event.target.value))}
                                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={t('login.modal.cardExpiry')}
                                        value={cardExpiry}
                                        onChange={event => setCardExpiry(formatCardExpiry(event.target.value))}
                                        className="block w-1/2 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={t('login.modal.cardCvc')}
                                        value={cardCvc}
                                        onChange={event => setCardCvc(formatCardCvc(event.target.value))}
                                        className="block w-1/2 rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                            {t('login.modal.submit')}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default LoginScreen;
