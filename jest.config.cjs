module.exports = {
  preset: 'ts-jest', // If using TypeScript, else omit it
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // For TypeScript files
    '^.+\\.(js|jsx)$': 'babel-jest', // For JS/JSX files
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Setup file for any global configurations
};
