const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

const karma_index = 'spec/karma_spec_index.js';

module.exports = (config) => {
  config.set({
    browsers: ['ChromeHeadless'],

    frameworks: ['jasmine'],

    // ... normal karma configuration
    files: [
      karma_index,

      'node_modules/karma-read-json/karma-read-json.js',
      { pattern: 'spec/fixture/**/*.json', included: false },
    ],

    webpack: require('./karma-webpack.config.js'),

    preprocessors: {
      [karma_index]: ['webpack', 'sourcemap'],
    },
  });
};
