const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
      options: {
        projectConfig: {
          root: "",
          sourceRoot: "",
          buildOptions: {
            tsConfig: "./tsconfig.app.json",
          },
        },
      },
    },
    specPattern: "**/*.cy.ts",
  },
});
