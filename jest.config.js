module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: [
    'tests',
  ],
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};
