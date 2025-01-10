// Salesforce API endpoints
const SF_API_VERSION = 'v58.0';
const SF_LOGIN_URL = 'https://login.salesforce.com';
const SF_API_URL = 'https://login.salesforce.com/services/data/' + SF_API_VERSION;
const SF_AUTH_URL = `${SF_LOGIN_URL}/services/oauth2/authorize`;
const SF_TOKEN_URL = `${SF_LOGIN_URL}/services/oauth2/token`;

// CORS headers - Allow Cloudflare Pages domains
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  // Allow if it's a Cloudflare Pages domain or localhost
  if (origin.endsWith('.pages.dev') || origin.startsWith('http://localhost')) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }
  // Default CORS headers for other domains
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle CORS preflight requests
async function handleOptions(request) {
  return new Response(null, {
    headers: getCorsHeaders(request),
  });
}

// Get OAuth URL for Salesforce login
function getOAuthUrl(env) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.SF_CLIENT_ID,
    redirect_uri: env.REDIRECT_URI,
    state: 'some-state-value', // You might want to make this dynamic for security
  });
  
  return `${SF_AUTH_URL}?${params.toString()}`;
}

// Exchange authorization code for access token
async function getAccessToken(code, env) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.SF_CLIENT_ID,
    client_secret: env.SF_CLIENT_SECRET,
    redirect_uri: env.REDIRECT_URI,
    code: code,
  });

  const response = await fetch(SF_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  return response.json();
}

// Make authenticated Salesforce API request
async function sfRequest(accessToken, method, path, body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SF_API_URL}${path}`, options);
  
  if (!response.ok) {
    throw new Error(`Salesforce API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Handle API requests
async function handleRequest(request, env) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle OAuth callback
    if (path === '/auth/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        throw new Error('No authorization code provided');
      }

      const tokenResponse = await getAccessToken(code, env);
      
      return new Response(JSON.stringify({
        access_token: tokenResponse.access_token,
        instance_url: tokenResponse.instance_url,
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request),
        },
      });
    }

    // Get OAuth URL
    if (path === '/auth/url') {
      return new Response(JSON.stringify({
        url: getOAuthUrl(env),
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request),
        },
      });
    }

    // All other endpoints require an access token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: getCorsHeaders(request) 
      });
    }
    const accessToken = authHeader.split(' ')[1];

    // Search accounts
    if (path === '/api/accounts/search') {
      const searchTerm = url.searchParams.get('term') || '';
      const sosl = `FIND {${searchTerm}*} IN NAME FIELDS RETURNING Account(Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry)`;
      const results = await sfRequest(accessToken, 'GET', `/search?q=${encodeURIComponent(sosl)}`);
      
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request),
        },
      });
    }

    // Get pricebooks
    if (path === '/api/pricebooks') {
      const results = await sfRequest(accessToken, 'GET', '/query?q=SELECT Id, Name FROM Pricebook2');
      
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request),
        },
      });
    }

    // Get pricebook entries
    if (path === '/api/pricebookentries') {
      const priceBookId = url.searchParams.get('pricebookId');
      if (!priceBookId) {
        throw new Error('Price book ID is required');
      }

      const soql = `SELECT Id, UnitPrice, Product2.Name, Product2.ProductCode FROM PricebookEntry WHERE Pricebook2Id = '${priceBookId}'`;
      const results = await sfRequest(accessToken, 'GET', `/query?q=${encodeURIComponent(soql)}`);
      
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request),
        },
      });
    }

    // Handle 404 for unknown endpoints
    return new Response('Not Found', {
      status: 404,
      headers: getCorsHeaders(request),
    });
  } catch (error) {
    // Handle errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(request),
      },
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    return handleRequest(request, env);
  },
};
