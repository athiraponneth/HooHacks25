module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'babel-plugin-dotenv-import',
        {
          moduleName: 'react-native-dotenv', // This is the module you'll import in your JS files
          path: '.env', // Path to your .env file
        },
      ],
    ],
  };
  