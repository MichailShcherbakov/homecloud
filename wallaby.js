module.exports = () => {
  return {
    autoDetect: true,
    testFramework: {
      configFile: './packages/desktop/vitest.config.ts',
    },
  };
};
