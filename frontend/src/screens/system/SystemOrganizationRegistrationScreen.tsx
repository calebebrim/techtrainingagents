import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { identifierMetaByCountry, formatIdentifier, CountryCode } from '../../utils/organizationIdentifier';

const countries: Array<{ code: CountryCode; label: string }> = [
    { code: 'BR', label: 'Brasil' },
    { code: 'US', label: 'United States' },
];

const SystemOrganizationRegistrationScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotifications();

    const [country, setCountry] = useState<CountryCode>('BR');
    const [organizationName, setOrganizationName] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [administratorName, setAdministratorName] = useState('');
    const [administratorEmail, setAdministratorEmail] = useState('');
    const [governmentId, setGovernmentId] = useState('');
    const [address, setAddress] = useState('');

    const identifierMeta = useMemo(() => identifierMetaByCountry[country], [country]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        showNotification({
            title: 'Registration submitted',
            message: `${organizationName || 'Organization'} was queued for provisioning.`,
            type: 'success',
        });
        navigate('/system/organizations');
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/system/organizations')}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-500"
                    >
                        ← Back to organizations
                    </button>
                    <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">Register a new tenant</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Capture the legal and administrative details for a client organization before provisioning their workspace.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="org-name">
                            Organization name
                        </label>
                        <input
                            id="org-name"
                            value={organizationName}
                            onChange={event => setOrganizationName(event.target.value)}
                            required
                            placeholder="Acme Corporation"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="company-code">
                            Company code
                        </label>
                        <input
                            id="company-code"
                            value={companyCode}
                            onChange={event => setCompanyCode(event.target.value)}
                            required
                            placeholder="Internal reference"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="country">
                            Operating country
                        </label>
                        <select
                            id="country"
                            value={country}
                            onChange={event => setCountry(event.target.value as CountryCode)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        >
                            {countries.map(option => (
                                <option key={option.code} value={option.code}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="government-id">
                            {identifierMeta.label}
                        </label>
                        <input
                            id="government-id"
                            value={governmentId}
                            onChange={event => setGovernmentId(formatIdentifier(country, event.target.value))}
                            placeholder={identifierMeta.placeholder}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="administrator-name">
                            Administrator name
                        </label>
                        <input
                            id="administrator-name"
                            value={administratorName}
                            onChange={event => setAdministratorName(event.target.value)}
                            required
                            placeholder="Primary contact"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="administrator-email">
                            Administrator email
                        </label>
                        <input
                            id="administrator-email"
                            type="email"
                            value={administratorEmail}
                            onChange={event => setAdministratorEmail(event.target.value)}
                            required
                            placeholder="admin@client.com"
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="address">
                        Organization address
                    </label>
                    <textarea
                        id="address"
                        value={address}
                        onChange={event => setAddress(event.target.value)}
                        required
                        rows={3}
                        placeholder="Street, number, city, state, ZIP"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/system/organizations')}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                    >
                        Submit registration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemOrganizationRegistrationScreen;
