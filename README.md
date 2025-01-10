# Quoting Calculator

A web-based calculator tool for generating and managing quotes, optimized for Cloudflare Pages deployment.

## Live Demo
Production URL: [Quoting Calculator](https://quoting-calculator.pages.dev/)

## Features
- Quote calculation with multiple items
- Interactive web interface
- Easy-to-use form inputs
- Cloudflare Pages compatible
- Fast global CDN delivery
- Tax calculation support
- Save/Load quotes functionality
- Print quotes
- Flexible discount options (percentage or fixed amount)

## Project Structure
```
quoting-calculator/
├── public/           # Static assets directory
│   ├── index.html   # Main application page
│   ├── css/         # Stylesheet directory
│   └── js/          # JavaScript files
└── wrangler.toml    # Cloudflare configuration
```

## Local Development
1. Clone this repository
2. Navigate to the project directory
3. Serve the `public` directory using a local server
4. Open your browser and visit the local server URL

## Deployment
The application is automatically deployed to Cloudflare Pages at [https://quoting-calculator.pages.dev/](https://quoting-calculator.pages.dev/)

### Custom Domain Setup (Future)
To set up a custom domain:
1. Purchase your desired domain
2. Add it to Cloudflare
3. Configure DNS settings with a CNAME record pointing to quoting-calculator.pages.dev
4. Add the custom domain in Cloudflare Pages settings

## Development
- All static assets are in the `public` directory
- Edit files in `public` directory to make changes
- Cloudflare Pages will automatically deploy changes when you push to your repository

## Environment Variables
The backend requires several environment variables to be set in Cloudflare Workers:

### Salesforce Credentials
These can be set either through the Cloudflare Dashboard or using wrangler CLI:

#### Using Cloudflare Dashboard:
1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages > cpq-api > Settings > Variables
3. Add these as encrypted environment variables:
   - SF_USERNAME
   - SF_PASSWORD
   - SF_SECURITY_TOKEN
   - SF_CLIENT_ID
   - SF_CLIENT_SECRET

#### Using Wrangler CLI:
```bash
npx wrangler secret put SF_USERNAME
npx wrangler secret put SF_PASSWORD
npx wrangler secret put SF_SECURITY_TOKEN
npx wrangler secret put SF_CLIENT_ID
npx wrangler secret put SF_CLIENT_SECRET
```

Note: Never commit these credentials to version control. They should always be set as environment variables.

If needed, you can configure environment variables in your Cloudflare Pages project settings.

## Salesforce Authentication

The application uses OAuth 2.0 Web Server flow for secure authentication with Salesforce. Users will be prompted to log in through Salesforce's login page.

### Connected App Setup
1. Log in to Salesforce production org
2. Go to Setup > App Manager
3. Click "New Connected App"
4. Fill in the details:
   - Connected App Name: `Quoting Calculator`
   - API Name: `Quoting_Calculator`
   - Contact Email: (your email)
5. Enable OAuth Settings:
   - Callback URL: `https://cpq-api.nav-sharma.workers.dev/auth/callback`
   - OAuth Scopes:
     - Access and manage your data (api)
     - Perform requests at any time (refresh_token, offline_access)
     - Access custom permissions (custom_permissions)

### Security
- The application uses OAuth 2.0 for secure authentication
- No Salesforce credentials are stored
- Each user authenticates directly with Salesforce
- Access tokens can be revoked if needed
- All API requests are made with user context
