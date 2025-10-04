'use strict';

const ORGANIZATIONS = [
  {
    id: '9c7d1f27-1af8-4d34-8b13-a3ff6bd7f3ca',
    name: 'Aurora Learning Labs',
    slug: 'aurora-learning-labs',
    cnpj: '12.345.678/0001-99',
    domain: 'aurora-learning.com',
    description: 'Plataforma whitelabel de capacitação corporativa focada em dados e IA aplicada.',
    logo_url: 'https://picsum.photos/seed/org1/200/200',
    plan: 'enterprise',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2f861508-239e-41f4-b12a-2e5f872c71aa',
    name: 'Nimbus Industries',
    slug: 'nimbus-industries',
    cnpj: '98.765.432/0001-55',
    domain: 'nimbus.io',
    description: 'Programa de capacitação contínua para equipes técnicas e administrativas.',
    logo_url: 'https://picsum.photos/seed/org2/200/200',
    plan: 'standard',
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('organizations', ORGANIZATIONS, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('organizations', {
      id: ORGANIZATIONS.map((org) => org.id)
    });
  }
};
