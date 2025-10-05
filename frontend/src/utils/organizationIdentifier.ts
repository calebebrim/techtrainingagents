type CountryCode = 'BR' | 'US';

const formatCnpj = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    const parts = [
        digits.slice(0, 2),
        digits.slice(2, 5),
        digits.slice(5, 8),
        digits.slice(8, 12),
        digits.slice(12, 14),
    ];

    if (digits.length <= 2) return parts[0];
    if (digits.length <= 5) return `${parts[0]}.${parts[1]}`;
    if (digits.length <= 8) return `${parts[0]}.${parts[1]}.${parts[2]}`;
    if (digits.length <= 12) return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}`;
    return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4]}`;
};

const formatEin = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) {
        return digits;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

export const identifierMetaByCountry: Record<CountryCode, { label: string; placeholder: string; formatter: (value: string) => string }>
    = {
        BR: {
            label: 'CNPJ',
            placeholder: '00.000.000/0000-00',
            formatter: formatCnpj,
        },
        US: {
            label: 'Employer Identification Number (EIN)',
            placeholder: '12-3456789',
            formatter: formatEin,
        },
    } as const;

export const formatIdentifier = (country: CountryCode, value: string): string => {
    return identifierMetaByCountry[country].formatter(value);
};

export type { CountryCode };
