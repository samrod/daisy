// @flow weak
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      "module-resolver",
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
