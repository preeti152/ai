module.exports = {
  community: [
    'community/community-guidelines',
    {
      type: 'category',
      label: 'Local Guilds',
      collapsed: false,
      items: [
        'guilds/guild-india',
        'guilds/guild-ireland',
        'guilds/guild-QuadState',
        'guilds/guild-raleigh',
      ],
    },
    'community/reading-club',
  ],
  events: [
    'events/2022-events',
    'events/past-events',
  ],
  learning: [
    'learning/training-paths',
     {
      type: 'category',
      label: 'Articles',
      collapsed: false,
      items: [
        'learning/articles/responsible-use',
      ],
    },
    {
      type: 'category',
      label: 'Courses',
      collapsed: false,
      items: [
        'training/azure-training',
      ],
    },
    'learning/faq',
    'learning/glossary',
  ],
  standards: [
    'standards/platforms',
    'standards/ai-services',
    'standards/reuse',
    'standards/best-practices',
    'standards/kpis',
    'standards/references'
  ],
};
