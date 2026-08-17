// Loads .env into Expo config so the phone gets the correct API URL (not localhost).
require('dotenv').config();

const appJson = require('./app.json');

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:4000/api/v1';

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      package: 'com.dreamerdev.dreamerdrop',
      usesCleartextTraffic: true,
    },

    extra: {
      ...appJson.expo.extra,
      apiUrl,
      eas: {
        projectId: 'f59f0837-7b5b-410f-bff7-11cc70f79dd6',
      },
    },
  },
};

