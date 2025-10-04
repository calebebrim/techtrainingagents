'use strict';

const ENROLLMENTS = [
  {
    id: 'c97ec3fc-9e3b-4c27-8aad-a91ffabc3f5c',
    user_id: 'f5fb4aec-4b27-4e3b-9e6a-65538ad888f1',
    course_id: '0b4e8537-4cf4-4e3d-865f-44bb3a8ce0d1',
    status: 'IN_PROGRESS',
    progress: 0.65,
    score: 82,
    topic_scores: [
      { topicId: '2a8bb847-3f25-4a31-9586-9dacf4d37502', topicName: 'Panorama de IA no mercado', score: 90 },
      { topicId: '8a0b6c26-8bb2-4e6b-b39c-4ac5cc6d5dcd', topicName: 'Fluxos de dados para IA', score: 80 },
      { topicId: 'f3b6b65d-4be8-4c4a-8c02-62de8576e89e', topicName: 'Operacionalizando Modelos', score: -1 }
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    last_accessed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'fd9aeec1-5ddc-4a7a-8fb1-d8e540b7c247',
    user_id: 'dbeb0a06-832a-421a-98cf-27d573479d7e',
    course_id: '8efc5f57-c497-4319-af2c-936fd9a7d0e0',
    status: 'COMPLETED',
    progress: 1,
    score: 95,
    topic_scores: [
      { topicId: 'a15a714a-7fcb-47ca-ba75-a2f961b10996', topicName: 'Arquitetura de componentização', score: 98 },
      { topicId: 'f2b67f4f-2850-4e04-b55d-70f979dad6d4', topicName: 'Gerenciamento de estado avançado', score: 94 },
      { topicId: '9ae7d2f3-37f1-4088-89db-105eb7d43837', topicName: 'Observabilidade de frontend', score: 92 }
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    last_accessed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '59af0eed-8906-47cc-b34c-82adbd94c3d4',
    user_id: 'e1f919b3-f20c-4be5-9d0c-36fe0a7413c2',
    course_id: '0b4e8537-4cf4-4e3d-865f-44bb3a8ce0d1',
    status: 'IN_PROGRESS',
    progress: 0.35,
    score: 64,
    topic_scores: [
      { topicId: '2a8bb847-3f25-4a31-9586-9dacf4d37502', topicName: 'Panorama de IA no mercado', score: 70 },
      { topicId: '8a0b6c26-8bb2-4e6b-b39c-4ac5cc6d5dcd', topicName: 'Fluxos de dados para IA', score: 58 },
      { topicId: 'f3b6b65d-4be8-4c4a-8c02-62de8576e89e', topicName: 'Operacionalizando Modelos', score: -1 }
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    last_accessed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('user_courses', ENROLLMENTS, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_courses', {
      id: ENROLLMENTS.map((enrollment) => enrollment.id)
    });
  }
};
