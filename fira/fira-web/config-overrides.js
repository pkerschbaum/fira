/* taken from: https://stackoverflow.com/questions/59555827/sharing-code-between-typescript-projects-with-react */
const { override, removeModuleScopePlugin, getBabelLoader } = require('customize-cra');
const path = require('path');

const addCommon = (config) => {
  const loader = getBabelLoader(config, false);
  const commonPath = path.normalize(path.join(process.cwd(), '../commons')).replace(/\\/g, '\\');
  loader.include = [loader.include, commonPath];
  return config;
};
module.exports = override(addCommon, removeModuleScopePlugin());
