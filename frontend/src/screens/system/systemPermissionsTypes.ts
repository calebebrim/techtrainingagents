export type SystemRole = 'SYSTEM_ADMIN' | 'ORG_ADMIN' | 'COURSE_COORDINATOR' | 'TECHNICAL_STAFF';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'invited';

export interface SystemUser {
    id: string;
    name: string;
    email: string;
    organization: string;
    roles: SystemRole[];
    status: UserStatus;
    lastActive: string;
    groups: string[];
    seatsUsed: number;
}

export const roleOrder: SystemRole[] = ['SYSTEM_ADMIN', 'ORG_ADMIN', 'COURSE_COORDINATOR', 'TECHNICAL_STAFF'];

export const roleLabels: Record<SystemRole, string> = {
    SYSTEM_ADMIN: 'System Admin',
    ORG_ADMIN: 'Organization Admin',
    COURSE_COORDINATOR: 'Course Coordinator',
    TECHNICAL_STAFF: 'Technical Staff',
};

export const statusStyles: Record<UserStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    inactive: 'bg-gray-200 text-gray-700 dark:bg-gray-600/30 dark:text-gray-200',
    suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    invited: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
};

export type ManageUserHandler = (userId: string) => void;
export type ImpersonateHandler = (user: SystemUser) => void;

export interface SystemUserTableControls {
    organizations: string[];
    roleLabels: Record<SystemRole, string>;
    canImpersonate: boolean;
    impersonatedUserId: string | null;
    impersonationLoadingId: string | null;
    onManageUser: ManageUserHandler;
    onImpersonateUser: ImpersonateHandler;
}

export interface SystemUserTableProps extends SystemUserTableControls {
    users: SystemUser[];
    isLoading: boolean;
    roleOrder: SystemRole[];
    totalAccounts: number;
}

export type PaginationState = {
    page: number;
    totalPages: number;
    pageSize: number;
};

export interface TableActionButtonsProps {
    user: SystemUser;
    controls: SystemUserTableControls;
}

export type FiltersState = {
    name: string;
    organization: string;
    role: SystemRole | 'all';
    status: UserStatus | 'all';
    seats: 'all' | 'occupied' | 'available';
};

export const defaultFilters: FiltersState = {
    name: '',
    organization: 'all',
    role: 'all',
    status: 'all',
    seats: 'all',
};

export const PAGE_SIZE = 10;

export type FilterChangeHandler = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
