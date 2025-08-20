module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // This creates the '@/' alias to point to your root directory
            '@': './', 
          },
        },
      ],
      'expo-router/babel', // This is also required for Expo Router
    ],
  };
};