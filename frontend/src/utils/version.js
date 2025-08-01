// Version utility to read version from package.json
import packageJson from '../../package.json';

export const getVersion = () => {
  return packageJson.version;
};

export const getVersionDisplay = () => {
  const version = getVersion();
  return `v${version}`;
}; 