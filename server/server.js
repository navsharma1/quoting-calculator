require('dotenv').config();
const express = require('express');
const jsforce = require('jsforce');
const cors = require('cors');
const config = require('./config');

const app = express();
const port = config.PORT || 3000;

// Enable CORS for all routes with detailed logging
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        headers: req.headers
    });
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Salesforce connection
const conn = new jsforce.Connection({
    loginUrl: config.SF_LOGIN_URL
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Server is running' });
});

// Connect to Salesforce on server start
conn.login(config.SF_USERNAME, config.SF_PASSWORD + config.SF_SECURITY_TOKEN, async (err) => {
    if (err) {
        console.error('Error connecting to Salesforce:', err);
        return;
    }
    console.log('Connected to Salesforce successfully!');
    
    try {
        // Get current user info
        const userInfo = await conn.identity();
        console.log('Logged in as:', {
            username: userInfo.username,
            organization_id: userInfo.organization_id,
            user_id: userInfo.user_id
        });

        // Get user's profile and permission sets
        const user = await conn.sobject('User')
            .retrieve(userInfo.user_id);
        console.log('User profile:', user.ProfileId);
        
        // Get user's role hierarchy
        const userRole = await conn.query(`
            SELECT 
                Id,
                Name,
                ParentRoleId,
                RollupDescription
            FROM UserRole 
            WHERE Id = '${user.UserRoleId}'
        `);
        console.log('User role:', userRole.records[0]);

        // Get user's permission sets
        const permissionSets = await conn.query(`
            SELECT 
                PermissionSet.Name,
                PermissionSet.Label,
                PermissionSet.PermissionsViewAllData,
                PermissionSet.PermissionsModifyAllData
            FROM PermissionSetAssignment 
            WHERE AssigneeId = '${userInfo.user_id}'
        `);
        console.log('User permission sets:', permissionSets.records);
        
        // Get user's profile details
        const profile = await conn.query(`
            SELECT 
                Id,
                Name,
                UserLicense.Name,
                PermissionsModifyAllData,
                PermissionsViewAllData
            FROM Profile 
            WHERE Id = '${user.ProfileId}'
        `);
        console.log('User profile details:', profile.records[0]);

        // Get sharing settings
        const sharingSettings = await conn.query(`
            SELECT 
                Id,
                MasterLabel,
                DeveloperName
            FROM SharingSettings
            WHERE SobjectType = 'Account'
        `);
        console.log('Account sharing settings:', sharingSettings.records);

    } catch (error) {
        console.error('Error getting user context:', error);
    }
});

// Get all price books
app.get('/api/pricebooks', async (req, res) => {
    console.log('Received request for price books:', {
        query: req.query,
        headers: req.headers,
        url: req.url
    });
    
    try {
        const result = await conn.query('SELECT Id, Name, IsActive FROM Pricebook2 WHERE IsActive = true');
        console.log('Query results:', result);
        res.json(result.records);
    } catch (error) {
        console.error('Error fetching price books:', error);
        res.status(500).json({ 
            error: 'Error fetching price books', 
            details: error.message,
            stack: error.stack
        });
    }
});

// Get price book entries for a specific price book
app.get('/api/pricebook/:id/entries', async (req, res) => {
    console.log('Received request for price book entries:', {
        query: req.query,
        headers: req.headers,
        url: req.url
    });
    
    try {
        const result = await conn.query(`
            SELECT 
                Id,
                Product2.Name,
                UnitPrice,
                Product2.Description,
                IsActive
            FROM PricebookEntry
            WHERE Pricebook2Id = '${req.params.id}'
            AND IsActive = true
        `);
        console.log('Query results:', result);
        res.json(result.records);
    } catch (error) {
        console.error('Error fetching price book entries:', error);
        res.status(500).json({ 
            error: 'Error fetching price book entries', 
            details: error.message,
            stack: error.stack
        });
    }
});

// Search Salesforce accounts
app.get('/api/accounts/search', async (req, res) => {
    console.log('Received search request:', {
        query: req.query,
        headers: req.headers,
        url: req.url
    });
    
    try {
        const searchTerm = req.query.term || '';
        console.log('Searching for term:', searchTerm);

        // Get total number of accounts
        const countQuery = 'SELECT COUNT() FROM Account';
        const countResult = await conn.query(countQuery);
        console.log('Total accounts in Salesforce:', countResult.totalSize);

        // Query all accounts
        let records = [];
        let done = false;
        let queryLocator = null;

        const baseQuery = `
            SELECT 
                Id,
                Name,
                BillingStreet,
                BillingCity,
                BillingState,
                BillingPostalCode,
                BillingCountry,
                CreatedById,
                LastModifiedById,
                OwnerId,
                Owner.Name,
                CreatedBy.Name,
                LastModifiedBy.Name,
                CreatedDate,
                LastModifiedDate
            FROM Account
            ${searchTerm ? `WHERE Name LIKE '%${searchTerm}%'` : ''}
            ORDER BY Name ASC
        `;

        while (!done) {
            let result;
            if (queryLocator) {
                result = await conn.queryMore(queryLocator);
            } else {
                result = await conn.query(baseQuery);
            }

            records = records.concat(result.records);
            console.log(`Retrieved ${result.records.length} accounts. Total so far: ${records.length}`);

            if (result.done) {
                done = true;
            } else {
                queryLocator = result.nextRecordsUrl;
            }
        }

        console.log(`Total accounts retrieved: ${records.length}`);
        res.json(records);
    } catch (error) {
        console.error('Error searching accounts:', error);
        res.status(500).json({ 
            error: 'Error searching accounts', 
            details: error.message,
            stack: error.stack
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
