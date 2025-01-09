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
If needed, you can configure environment variables in your Cloudflare Pages project settings.
