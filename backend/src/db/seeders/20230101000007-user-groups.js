'use strict';

const USER_GROUPS = [
  {
    id: '50123af4-6e6c-4e22-928a-9d07bc9ea9f5',
    user_id: 'f5fb4aec-4b27-4e3b-9e6a-65538ad888f1',
    group_id: 'c4939ccf-21f4-4f9b-8a7d-5f7f52e6a992',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'a1e7af74-5eff-4eaa-b0f6-cac22fbd28aa',
    user_id: 'f5fb4aec-4b27-4e3b-9e6a-65538ad888f1',
    group_id: '2ea66c33-6eaf-4da7-932c-2d9b998bb2cd',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'b8c9e13f-9874-4581-8bde-7460a90d9f27',
    user_id: 'dbeb0a06-832a-421a-98cf-27d573479d7e',
    group_id: 'd37be285-6d28-432b-9a3f-68d55a09bcee',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'da19c3ad-f3df-4d9c-8b63-dfaf36b6eb57',
    user_id: 'e1f919b3-f20c-4be5-9d0c-36fe0a7413c2',
    group_id: '2ea66c33-6eaf-4da7-932c-2d9b998bb2cd',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '6c6e24ad-7b0e-4e42-9fb0-58b8aac0d0a2',
    user_id: 'e78b4c88-df9f-4f63-813c-7b0a2eaa3a8d',
    group_id: 'c4939ccf-21f4-4f9b-8a7d-5f7f52e6a992',
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('user_groups', USER_GROUPS, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_groups', {
      id: USER_GROUPS.map((entry) => entry.id)
    });
  }
};
