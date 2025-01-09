# Quoting Calculator

A web-based calculator tool for generating and managing quotes, optimized for Cloudflare Pages deployment.

## Features
- Quote calculation
- Interactive web interface
- Easy-to-use form inputs
- Cloudflare Pages compatible
- Fast global CDN delivery

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

## Deployment to Cloudflare Pages
1. Fork this repository to your GitHub account
2. Log in to Cloudflare Dashboard
3. Go to Pages > Create a project
4. Connect your GitHub repository
5. Configure your build settings:
   - Build command: (leave empty)
   - Build output directory: `public`
6. Deploy!

## Development
- All static assets are in the `public` directory
- Edit files in `public` directory to make changes
- Cloudflare Pages will automatically deploy changes when you push to your repository

## Environment Variables
If needed, you can configure environment variables in your Cloudflare Pages project settings.
