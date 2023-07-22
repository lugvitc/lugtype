import { defaults as tsjPreset } from "ts-jest/presets";

export default {
  preset: "@shelf/jest-mongodb",
  transform: tsjPreset.transform,
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup-tests.ts"],
  modulePathIgnorePatterns: ["<rootDir>/__tests__/setup-tests.ts"],
  coverageThreshold: {
    global: {
      // These percentages should never decrease
      statements: 40,
      branches: 38,
      functions: 25,
      lines: 43,
    },
  },
};
