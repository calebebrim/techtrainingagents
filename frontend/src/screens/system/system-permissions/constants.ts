import { Invite, SystemRole } from './types';

export const pendingInvites: Invite[] = [
  {
    id: 'invite-1',
    email: 'ana.lima@alphametal.com',
    organization: 'AlphaMetal',
    sentAt: '1 day ago',
    role: 'ORG_ADMIN'
  },
  {
    id: 'invite-2',
    email: 'diego.silva@techspark.io',
    organization: 'TechSpark Labs',
    sentAt: '3 hours ago',
    role: 'TECHNICAL_STAFF'
  }
];

export const groupOptions = [
  'System Maintainers',
  'Org Owners',
  'Security Reviewers',
  'Compliance Review',
  'Readonly'
];

export const DEFAULT_INVITE_ORG = 'Universal Fleets';
export const DEFAULT_INVITE_ROLE: SystemRole = 'ORG_ADMIN';
