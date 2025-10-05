'use strict';

const USERS = [
  {
    id: 'f5fb4aec-4b27-4e3b-9e6a-65538ad888f1',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Alice Smith',
    email: 'alice@aurora-learning.com',
    avatar_url: 'https://picsum.photos/seed/alice/100/100',
    roles: ['System Admin', 'Administrator'],
    groups_meta: [],
    status: 'ACTIVE',
    theme_preference: 'dark',
    last_login_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'dbeb0a06-832a-421a-98cf-27d573479d7e',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Bruno Pereira',
    email: 'bruno@aurora-learning.com',
    avatar_url: 'https://picsum.photos/seed/bruno/100/100',
    roles: ['Course Coordinator'],
    groups_meta: [],
    status: 'ACTIVE',
    theme_preference: 'system',
    last_login_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'e1f919b3-f20c-4be5-9d0c-36fe0a7413c2',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Carla Nogueira',
    email: 'carla@aurora-learning.com',
    avatar_url: 'https://picsum.photos/seed/carla/100/100',
    roles: ['Technical Staff'],
    groups_meta: [],
    status: 'ACTIVE',
    theme_preference: 'light',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'a11565a5-0330-4f29-9b5d-b6a71ebfbcad',
    organization_id: '2f861508-239e-41f4-b12a-2e5f872c71aa',
    name: 'Diego Fernández',
    email: 'diego@nimbus.io',
    avatar_url: 'https://picsum.photos/seed/diego/100/100',
    roles: ['Administrator'],
    groups_meta: [],
    status: 'ACTIVE',
    theme_preference: 'system',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'e78b4c88-df9f-4f63-813c-7b0a2eaa3a8d',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Calebe Brim',
    email: 'calebebrim@gmail.com',
    avatar_url: null,
    roles: ['System Admin'],
    groups_meta: [],
    status: 'ACTIVE',
    theme_preference: 'system',
    last_login_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    const isSqlite = queryInterface.sequelize.getDialect() === 'sqlite';
    const payload = isSqlite
      ? USERS.map((user) => ({
          ...user,
          roles: JSON.stringify(user.roles ?? []),
          groups_meta: JSON.stringify(user.groups_meta ?? [])
        }))
      : USERS;

    await queryInterface.bulkInsert('users', payload, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      id: USERS.map((user) => user.id)
    });
  }
};
