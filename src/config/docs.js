module.exports = {
  opts: {
    readme: "./README.md",
    package: "./package.json",
    template: "./node_modules/jsdoc-fresh",
    recurse: true,
    verbose: true,
    destination: "./html-docs/"
  },
  plugins: ["plugins/markdown"],
  source: {
    include: ["./dist/lib"],
    includePattern: "\\.esm.js"
  },
  templates: {
    includeDate: false,
    sourceFiles: false,
    theme: "lumen",
    default: {
      outputSourceFiles: false
    }
  },
  markdown: {
    idInHeadings: true
  }
};
