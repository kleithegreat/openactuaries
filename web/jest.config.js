const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lucide-react$':
      '<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!(lucide-react)/)'],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
