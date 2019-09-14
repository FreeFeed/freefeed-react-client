module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx}'],
  coverageThreshold: {
    global: {
      statements: 7,
      branches: 3,
      lines: 8,
      functions: 2,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/testSetup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: ['<rootDir>/test/jest/**/*.test.js'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/fileMock.js',
    'throbber-worker': '<rootDir>/test/workerMock.js',
  },
};
