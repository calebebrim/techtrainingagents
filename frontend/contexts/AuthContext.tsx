
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { gql } from '@apollo/client';
import { User, UserRole } from '../types';
import client from '../apollo';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface MeQueryResult {
    me: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
        roles: string[];
        status?: string | null;
        themePreference?: string | null;
        organization?: {
            id: string;
            name?: string | null;
        } | null;
        groups?: Array<{ id: string }> | null;
    } | null;
}

const ME_QUERY = gql`
    query Me {
        me {
            id
            name
            email
            avatarUrl
            roles
            status
            themePreference
            organization {
                id
                name
            }
            groups {
                id
            }
        }
    }
`;

const mapRoles = (roles: string[]): UserRole[] => {
    const validRoles = Object.values(UserRole) as string[];
    return roles.filter((role): role is UserRole => validRoles.includes(role));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await client.query<MeQueryResult>({
                query: ME_QUERY,
                fetchPolicy: 'network-only'
            });
            if (data?.me) {
                const mappedUser: User = {
                    id: data.me.id,
                    name: data.me.name,
                    email: data.me.email,
                    avatarUrl: data.me.avatarUrl,
                    roles: mapRoles(data.me.roles ?? []),
                    organizationId: data.me.organization?.id ?? '',
                    organizationName: data.me.organization?.name,
                    status: data.me.status,
                    themePreference: data.me.themePreference,
                    groups: data.me.groups?.map((group) => group.id) ?? []
                };
                setUser(mappedUser);
            }
        } catch (error) {
            console.error('Failed to fetch user profile', error);
        } finally {
            setLoading(false);
        }
    }, [client]);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
