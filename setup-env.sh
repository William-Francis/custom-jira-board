#!/bin/bash

# Environment Setup Script for Jira Board Application
# This script helps you set up your environment variables

echo "🔧 Jira Board Environment Setup"
echo "================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Copy example file
echo "📋 Copying environment template..."
cp env.example .env.local

echo ""
echo "✅ Created .env.local file"
echo ""
echo "🔑 Now you need to fill in your Jira credentials:"
echo ""
echo "1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens"
echo "2. Click 'Create API token'"
echo "3. Give it a label (e.g., 'Jira Board App')"
echo "4. Copy the generated token"
echo ""
echo "📝 Edit .env.local and update these values:"
echo "   - VITE_JIRA_BASE_URL=https://your-domain.atlassian.net"
echo "   - VITE_JIRA_USERNAME=your-email@example.com"
echo "   - VITE_JIRA_API_TOKEN=your-api-token-here"
echo ""
echo "🚀 After updating .env.local, restart your development server:"
echo "   npm run dev"
echo ""
echo "📖 For more details, see ENVIRONMENT_SETUP.md"
