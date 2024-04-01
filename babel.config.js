// @flow weak
export default api => {
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['./src'],
          alias: {
            "@lib": './src/lib',
            "@assets": './assets',
            "@components": './src/components'
          }
        }
      ],
    ],
  };
};
