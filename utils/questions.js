const inquirer = require('inquirer');

module.exports = cb =>
  inquirer.prompt([
    {
      type: 'list',
      name: 'country_code',
      message: 'Select countryCode',
      choices: [
        {
          name: 'Cyprus',
          value: 'cy'
        },
        {
          name: 'Australia',
          value: 'au'
        },
        {
          name: 'Bahamas',
          value: 'bs'
        },
        {
          name: 'Italy',
          value: 'it'
        },
        {
          name: 'China',
          value: 'cn'
        },
        {
          name: 'Russia',
          value: 'ru'
        },
        {
          name: 'Belgium',
          value: 'be'
        },
        {
          name: 'Latvia',
          value: 'lv'
        },
        {
          name: 'India',
          value: 'in'
        },
        {
          name: 'USA',
          value: 'us'
        },
        {
          name: 'Unknown country code',
          value: '**'
        }
      ]
    },
    {
      type: 'list',
      name: 'custom_domain',
      message: 'Select custom domain',
      choices: [
        {
          name: 'icmarkets.com',
          value: 'icmarkets.com'
        },
        {
          name: 'icmarkets.eu',
          value: 'icmarkets.eu'
        },
        {
          name: 'icmarkets.sc',
          value: 'icmarkets.sc'
        },
        {
          name: 'icmarkets.bs',
          value: 'icmarkets.bs'
        },
        {
          name: 'icmarkets-zhv.com',
          value: 'icmarkets-zhv.com'
        },
        {
          name: 'icmarketsuk.com',
          value: 'icmarketsuk.com'
        },
        {
          name: 'icmarkets.mu',
          value: 'icmarkets.mu'
        }
      ]
    }
  ])
    .then(answers => cb(answers))
