require('dotenv').config();

module.exports = {
    SF_LOGIN_URL: process.env.SF_LOGIN_URL || 'https://test.salesforce.com',
    SF_USERNAME: process.env.SF_USERNAME,
    SF_PASSWORD: process.env.SF_PASSWORD,
    SF_SECURITY_TOKEN: process.env.SF_SECURITY_TOKEN,
    PORT: process.env.PORT || 3000,
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
};
