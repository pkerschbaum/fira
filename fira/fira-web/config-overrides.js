const {
  override,
  fixBabelImports,
  getBabelLoader,
  removeModuleScopePlugin,
  addBabelPreset,
  addBabelPlugin,
} = require('customize-cra');
const path = require('path');

// allow import of commons
/* taken from: https://stackoverflow.com/questions/59555827/sharing-code-between-typescript-projects-with-react */
const addCommon = (config) => {
  const loader = getBabelLoader(config, false);
  const commonPath = path
    .normalize(path.join(process.cwd(), '../fira-commons'))
    .replace(/\\/g, '\\');
  loader.include = [loader.include, commonPath];
  return config;
};

module.exports = override(
  /* improve startup time in dev mode (https://material-ui.com/guides/minimizing-bundle-size/#option-2) */
  fixBabelImports('core', {
    libraryName: '@material-ui/core',
    libraryDirectory: '',
    camel2DashComponentName: false,
  }),
  fixBabelImports('icons', {
    libraryName: '@material-ui/icons',
    libraryDirectory: '',
    camel2DashComponentName: false,
  }),

  addCommon,
  removeModuleScopePlugin(),

  // https://github.com/tkh44/emotion-create-react-app-example/blob/master/config-overrides.js
  // https://medium.com/@harryhedger/quick-how-to-use-the-emotion-css-prop-with-create-react-app-5f6aa0f0c5c5
  addBabelPlugin('emotion'),
  addBabelPreset('@emotion/babel-preset-css-prop'),
);
