module.exports = {
  reactNativePath: './node_modules/react-native',
  project: {
    ios: {},
    android: {},
  },
  // 👇 tämä estää bridgeless-tilan, kunnes kaikki kirjastot tukevat sitä
  experimental: {
    newArchitecture: false,
  },
};