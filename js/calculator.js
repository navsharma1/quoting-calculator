// API configuration
const API_URL = 'https://cpq-api.nav-sharma.workers.dev';
let accessToken = null;
let instanceUrl = null;

// Check if we're returning from OAuth
async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        try {
            const response = await fetch(`${API_URL}/auth/callback?code=${code}`);
            const data = await response.json();
            if (data.access_token) {
                accessToken = data.access_token;
                instanceUrl = data.instance_url;
                localStorage.setItem('sf_access_token', accessToken);
                localStorage.setItem('sf_instance_url', instanceUrl);
                // Remove code from URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return true;
            }
        } catch (error) {
            console.error('Error exchanging code for token:', error);
        }
    }
    return false;
}

// Check if we have a stored token
function checkStoredToken() {
    accessToken = localStorage.getItem('sf_access_token');
    instanceUrl = localStorage.getItem('sf_instance_url');
    return !!accessToken;
}

// Initialize authentication
async function initAuth() {
    if (await handleOAuthCallback()) {
        return true;
    }
    if (checkStoredToken()) {
        return true;
    }
    // Redirect to Salesforce login
    const response = await fetch(`${API_URL}/auth/url`);
    const data = await response.json();
    window.location.href = data.url;
    return false;
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    if (!accessToken) {
        throw new Error('Not authenticated');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
    });

    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('sf_access_token');
        localStorage.removeItem('sf_instance_url');
        window.location.reload();
        throw new Error('Authentication expired');
    }

    if (!response.ok) {
        throw new Error('API request failed');
    }

    return response.json();
}

function calculateItemTotal(item) {
    const users = parseFloat(item.querySelector('.item-users').value) || 0;
    const price = parseFloat(item.querySelector('.item-price').value) || 0;
    const term = item.querySelector('.item-term').value;
    const discount = parseFloat(item.querySelector('.item-discount').value) || 0;
    
    // Base calculation: users × price per user per month
    let total = users * price;
    
    // Apply discount first
    if (discount > 0) {
        total = total * (1 - discount / 100);
    }
    
    // Then apply term multiplier for annual
    if (term === 'annual') {
        total *= 12;
    }
    
    // Update the item's total display
    const totalDisplay = item.querySelector('.item-total');
    const periodDisplay = item.querySelector('.item-period');
    
    if (totalDisplay) {
        totalDisplay.textContent = formatCurrency(total);
    }
    
    if (periodDisplay) {
        periodDisplay.textContent = term === 'annual' ? 'per year' : 'per month';
    }
    
    return total;
}

function calculateTotal() {
    const items = itemsContainer.querySelectorAll('.quote-item');
    let total = 0;
    
    items.forEach(item => {
        total += calculateItemTotal(item);
    });
    
    // Update both subtotal and total
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) {
        subtotalElement.textContent = formatCurrency(total);
    }
    
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    
    return total;
}

function setupItemListeners(item) {
    const inputs = item.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', calculateTotal);
        input.addEventListener('input', calculateTotal);
    });

    // Setup quantity controls
    const decreaseBtn = item.querySelector('.decrease-users');
    const increaseBtn = item.querySelector('.increase-users');
    const usersInput = item.querySelector('.item-users');

    if (decreaseBtn && increaseBtn && usersInput) {
        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(usersInput.value) || 0;
            if (currentValue > 1) {
                usersInput.value = currentValue - 1;
                calculateTotal();
            }
        });

        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(usersInput.value) || 0;
            usersInput.value = currentValue + 1;
            calculateTotal();
        });
    }

    const deleteButton = item.querySelector('.delete-item');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            item.remove();
            calculateTotal();
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // First ensure we're authenticated
        if (!await initAuth()) {
            return; // Page will redirect to login
        }
        
        // Now initialize the calculator
        await initializeCalculator();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize the calculator. Please try refreshing the page.');
    }
});