'use strict';

const COURSES = [
  {
    id: '0b4e8537-4cf4-4e3d-865f-44bb3a8ce0d1',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    title: 'Fundamentos de Inteligência Artificial',
    description: 'Construa o alicerce para projetos de IA dentro da sua organização com foco em aplicações práticas.',
    thumbnail_url: 'https://picsum.photos/seed/course1/400/200',
    category: 'Inteligência Artificial',
    level: 'beginner',
    status: 'published',
    estimated_hours: 8,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '8efc5f57-c497-4319-af2c-936fd9a7d0e0',
    organization_id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    title: 'Arquitetura de Aplicações React',
    description: 'Coleção de padrões e boas práticas para entregar interfaces escaláveis e acessíveis.',
    thumbnail_url: 'https://picsum.photos/seed/course2/400/200',
    category: 'Desenvolvimento Frontend',
    level: 'intermediate',
    status: 'published',
    estimated_hours: 12,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'b5fcbe69-1464-4852-82aa-4fd1b5af512d',
    organization_id: '2f861508-239e-41f4-b12a-2e5f872c71aa',
    title: 'Governança de Dados para Líderes',
    description: 'Estruture programas de dados e IA alinhados com estratégia corporativa.',
    thumbnail_url: 'https://picsum.photos/seed/course3/400/200',
    category: 'Governança de Dados',
    level: 'advanced',
    status: 'published',
    estimated_hours: 10,
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('courses', COURSES, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('courses', {
      id: COURSES.map((course) => course.id)
    });
  }
};
