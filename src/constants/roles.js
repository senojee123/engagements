export const AVAILABLE_ROLES = [
  {
    id: 'Super Admin',
    name: 'Super Admin',
    description: 'Full system control, organization management, and security permissions.',
    badgeColor: 'indigo',
    permissions: ['all'],
  },
  {
    id: 'Brand',
    name: 'Brand',
    description: 'Manage brand identity, campaigns, and engagement experiences.',
    badgeColor: 'cyan',
    permissions: ['org.manage', 'events.manage', 'campaigns.create'],
  },
  {
    id: 'Marketing Agency',
    name: 'Marketing Agency',
    description: 'Build campaigns for client organizations and manage sub-accounts.',
    badgeColor: 'purple',
    permissions: ['org.read', 'events.manage', 'analytics.view'],
  },
  {
    id: 'Event Organizer',
    name: 'Event Organizer',
    description: 'Schedule events, coordinate venues, and run live interactive games.',
    badgeColor: 'amber',
    permissions: ['events.create', 'events.edit', 'engagement.trigger'],
  },
  {
    id: 'Venue Manager',
    name: 'Venue Manager',
    description: 'Manage physical venue displays, Wi-Fi portals, and local activations.',
    badgeColor: 'emerald',
    permissions: ['venue.manage', 'events.read', 'screens.configure'],
  },
];
