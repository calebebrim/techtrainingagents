'use strict';

const GROUPS = [
  {
    id: 'c4939ccf-21f4-4f9b-8a7d-5f7f52e6a992',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Administrators',
    description: 'Full access to organization configuration and analytics.',
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'd37be285-6d28-432b-9a3f-68d55a09bcee',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Course Coordinators',
    description: 'Manage catalog, learning paths and content curation.',
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2ea66c33-6eaf-4da7-932c-2d9b998bb2cd',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Technical Staff',
    description: 'Standard learner permissions focused on technical tracks.',
    is_system: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('groups', GROUPS, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('groups', {
      id: GROUPS.map((group) => group.id)
    });
  }
};
