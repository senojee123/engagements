export const AVAILABLE_ROLES = [
  {
    id: 'Brand',
    name: 'Brand',
    description: 'Manage brand identity, campaigns, and engagement experiences.',
    badgeColor: 'cyan',
    permissions: ['org.manage', 'events.manage', 'campaigns.create'],
  },
  {
    id: 'Admin',
    name: 'Admin',
    description: 'Full system control, organization management, and security permissions.',
    badgeColor: 'indigo',
    permissions: ['all'],
  },
];
