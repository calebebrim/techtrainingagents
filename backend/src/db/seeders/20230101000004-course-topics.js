'use strict';

const TOPICS = [
  {
    id: '2a8bb847-3f25-4a31-9586-9dacf4d37502',
    course_id: '0b4e8537-4cf4-4e3d-865f-44bb3a8ce0d1',
    name: 'Panorama de IA no mercado',
    summary: 'Casos de uso reais e tendências que justificam investimentos em IA.',
    position: 1,
    dependencies: [],
    estimated_minutes: 45,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '8a0b6c26-8bb2-4e6b-b39c-4ac5cc6d5dcd',
    course_id: '0b4e8537-4cf4-4e3d-865f-44bb3a8ce0d1',
    name: 'Fluxos de dados para IA',
    summary: 'Arquiteturas de ingestão e preparação de dados para projetos de IA.',
    position: 2,
    dependencies: ['2a8bb847-3f25-4a31-9586-9dacf4d37502'],
    estimated_minutes: 60,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'f3b6b65d-4be8-4c4a-8c02-62de8576e89e',
    course_id: '0b4e8537-4cf4-4e3d-865f-44bb3a8ce0d1',
    name: 'Operacionalizando Modelos',
    summary: 'Estratégias de monitoramento e performance para modelos em produção.',
    position: 3,
    dependencies: ['2a8bb847-3f25-4a31-9586-9dacf4d37502', '8a0b6c26-8bb2-4e6b-b39c-4ac5cc6d5dcd'],
    estimated_minutes: 55,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'a15a714a-7fcb-47ca-ba75-a2f961b10996',
    course_id: '8efc5f57-c497-4319-af2c-936fd9a7d0e0',
    name: 'Arquitetura de componentização',
    summary: 'Estruture componentes reutilizáveis com foco em acessibilidade.',
    position: 1,
    dependencies: [],
    estimated_minutes: 50,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'f2b67f4f-2850-4e04-b55d-70f979dad6d4',
    course_id: '8efc5f57-c497-4319-af2c-936fd9a7d0e0',
    name: 'Gerenciamento de estado avançado',
    summary: 'Aplicação de hooks customizados, context API e GraphQL.',
    position: 2,
    dependencies: ['a15a714a-7fcb-47ca-ba75-a2f961b10996'],
    estimated_minutes: 70,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '9ae7d2f3-37f1-4088-89db-105eb7d43837',
    course_id: '8efc5f57-c497-4319-af2c-936fd9a7d0e0',
    name: 'Observabilidade de frontend',
    summary: 'Melhores práticas de monitoramento de UX e performance.',
    position: 3,
    dependencies: ['a15a714a-7fcb-47ca-ba75-a2f961b10996'],
    estimated_minutes: 40,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'e4b9f354-5b70-4ae5-bb82-f12f5f382874',
    course_id: 'b5fcbe69-1464-4852-82aa-4fd1b5af512d',
    name: 'Fundamentos da governança',
    summary: 'Estruturação de papéis, políticas e processos de dados.',
    position: 1,
    dependencies: [],
    estimated_minutes: 35,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'ff66c29d-621f-4371-bcd6-7bbf094c5c63',
    course_id: 'b5fcbe69-1464-4852-82aa-4fd1b5af512d',
    name: 'Métricas e indicadores',
    summary: 'KPIs de qualidade e impacto de dados e IA no negócio.',
    position: 2,
    dependencies: ['e4b9f354-5b70-4ae5-bb82-f12f5f382874'],
    estimated_minutes: 45,
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    const isSqlite = queryInterface.sequelize.getDialect() === 'sqlite';
    const payload = isSqlite
      ? TOPICS.map((topic) => ({
          ...topic,
          dependencies: JSON.stringify(topic.dependencies ?? [])
        }))
      : TOPICS;

    await queryInterface.bulkInsert('course_topics', payload, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('course_topics', {
      id: TOPICS.map((topic) => topic.id)
    });
  }
};
