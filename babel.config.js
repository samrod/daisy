// @flow weak
export default api => {
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            common: './src/common',
            assets: './assets',
            components: './src/components'
          }
        }
      ],
    ],
  };
};
