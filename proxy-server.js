/**
 * Backend Proxy Server for Jira API
 * This server runs in Node.js and makes requests to Jira on behalf of the frontend
 * This bypasses CORS issues since the browser only talks to localhost
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get Jira credentials from environment
const JIRA_BASE_URL = process.env.VITE_JIRA_BASE_URL;
const JIRA_USERNAME = process.env.VITE_JIRA_USERNAME;
const JIRA_API_TOKEN = process.env.VITE_JIRA_API_TOKEN;

if (!JIRA_BASE_URL || !JIRA_USERNAME || !JIRA_API_TOKEN) {
  console.error('❌ Missing Jira credentials in environment variables');
  process.exit(1);
}

// Create basic auth header
const authHeader = `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_API_TOKEN}`).toString('base64')}`;

/**
 * Proxy endpoint for Jira API requests
 */
app.all('/api/jira/*', async (req, res) => {
  try {
    let jiraPath = req.path.replace('/api/jira', '');
    const queryString = req.url.split('?')[1] || '';
    
    // Handle special endpoints
    if (jiraPath === '/board') {
      // Get all boards - use the correct endpoint
      jiraPath = '/rest/agile/1.0/board';
    } else if (jiraPath.startsWith('/board/') && jiraPath.includes('/configuration')) {
      // Board configuration endpoint - use Agile API
      // e.g., /board/2415/configuration becomes /rest/agile/1.0/board/2415/configuration
      jiraPath = `/rest/agile/1.0${jiraPath}`;
    } else if (jiraPath.startsWith('/board/') && jiraPath.includes('/issue')) {
      // Board issues endpoint - use Agile API
      // e.g., /board/2415/issue becomes /rest/agile/1.0/board/2415/issue
      jiraPath = `/rest/agile/1.0${jiraPath}`;
    } else if (jiraPath.startsWith('/board/')) {
      // Get specific board info
      jiraPath = `/rest/agile/1.0${jiraPath}`;
    } else if (jiraPath.startsWith('/sprint/')) {
      // Sprint endpoints - use Agile API
      // e.g., /sprint/123/issue becomes /rest/agile/1.0/sprint/123/issue
      jiraPath = `/rest/agile/1.0${jiraPath}`;
    } else if (jiraPath.includes('/transitions')) {
      // Issue transitions endpoint - use REST API v3
      jiraPath = `/rest/api/3${jiraPath}`;
    } else if (jiraPath.includes('/issue')) {
      // Direct issue endpoints use rest/api/3
      jiraPath = `/rest/api/3${jiraPath}`;
    } else {
      // Default to REST API v3
      jiraPath = `/rest/api/3${jiraPath}`;
    }
    
    const url = queryString 
      ? `${JIRA_BASE_URL}${jiraPath}?${queryString}`
      : `${JIRA_BASE_URL}${jiraPath}`;
    
    console.log(`🔄 Proxying request to: ${req.method} ${url}`);
    
    const options = {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    
    // Add body for non-GET requests
    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, options);
    
    // Get response as text first to check if it's HTML
    const text = await response.text();
    
    // Handle 204 No Content (successful with no body)
    if (response.status === 204) {
      console.log(`✅ Successfully proxied ${req.method} ${url} (204 No Content)`);
      return res.status(204).send();
    }
    
    if (!response.ok) {
      console.error(`❌ Jira API error: ${response.status}`);
      console.error('Response body:', text);
      
      // Check if response is HTML (error page)
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        return res.status(response.status).json({
          error: 'Jira API error',
          message: `Got HTML response instead of JSON. Status: ${response.status}`,
          status: response.status,
          body: text.substring(0, 200),
        });
      }
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        return res.status(response.status).json({
          error: 'Jira API error',
          message: data.errorMessages || data.message || text,
          status: response.status,
          details: data,
        });
      } catch (e) {
        return res.status(response.status).json({
          error: 'Jira API error',
          message: text.substring(0, 200),
          status: response.status,
        });
      }
    }
    
    // Parse JSON response
    try {
      const data = JSON.parse(text);
      console.log(`✅ Successfully proxied ${req.method} ${url}`);
      res.json(data);
    } catch (e) {
      console.error(`❌ Failed to parse JSON response:`, e);
      res.status(500).json({
        error: 'Invalid JSON response from Jira',
        message: 'Jira returned non-JSON data',
        status: response.status,
        body: text.substring(0, 200),
      });
    }
  } catch (error) {
    console.error('❌ Proxy error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message || 'Unknown error occurred',
      details: error.toString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Jira Proxy Server running on http://localhost:${PORT}`);
  console.log(`📝 Using Jira: ${JIRA_BASE_URL}`);
  console.log(`👤 Username: ${JIRA_USERNAME}`);
  console.log(`🔑 Token: ${JIRA_API_TOKEN.substring(0, 10)}...`);
});

