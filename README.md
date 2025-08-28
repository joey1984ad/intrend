# Agency Digital Marketing Dashboard

A comprehensive digital marketing dashboard for agencies to showcase Meta Ads performance to their clients.

## Features

### Meta Ads Dashboard
- **Real-time Performance Metrics**: Clicks, impressions, reach, spend, CPC, CPM, CTR
- **Interactive Charts**: Area charts for trends, pie charts for platform distribution
- **Campaign Management**: Sort, filter, and bulk actions on campaigns
- **Multi-Account Support**: Manage multiple client accounts
- **Export Functionality**: Generate reports in PDF, Excel, or CSV formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### AI Creative Analysis
- **Automated Creative Review**: AI-powered analysis of Facebook ad creatives
- **Performance Insights**: Get creative performance predictions and recommendations
- **n8n Integration**: Seamless workflow automation for creative analysis
- **Real-time Processing**: Instant analysis results for faster decision making
- **Creative Optimization**: Data-driven suggestions for improving ad performance

### Subscription & Billing Management
- **Stripe Integration**: Complete payment processing and subscription management
- **Multiple Pricing Plans**: Starter (Free), Professional ($29/$290), Enterprise ($99/$990)
- **Billing Cycles**: Monthly and annual options with savings
- **Customer Portal**: Self-service subscription management
- **Webhook Processing**: Real-time subscription lifecycle management
- **Invoice Management**: Complete billing history and PDF downloads

### Key Components
- **Account Summary**: Overview of selected client account
- **Performance Charts**: Visual representation of key metrics
- **Campaign Table**: Detailed campaign performance with sorting and filtering
- **Notifications**: Real-time alerts and updates
- **Export Modal**: Customizable report generation

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: React charting library
- **Lucide React**: Icon library

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agency-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Validate your environment configuration**
   ```bash
   npm run validate:env
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
agency-dashboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes and endpoints
│   │   ├── facebook/      # Facebook API integration
│   │   └── ai/            # AI analysis endpoints
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── MetaDashboard.tsx  # Main dashboard component
│   ├── CreativeDetailModal.tsx # Creative analysis modal
│   └── WebhookConnectionTester.tsx # Webhook testing component
├── scripts/               # Utility and setup scripts
│   ├── validate-env.js    # Environment validation
│   ├── setup-env.js       # Environment setup
│   └── test-ai-analysis.js # AI analysis testing
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── .env                   # Production environment variables
├── .env.local             # Local development environment
└── README.md              # Project documentation
```

## Configuration

### Environment Variables

This project uses two environment files for different deployment scenarios:

#### Production Environment (`.env`)
- **Purpose**: Production deployment configuration
- **Contains**: All production API keys, database URLs, and service configurations
- **Usage**: Automatically loaded by Vercel and other production platforms
- **Security**: Never commit this file to version control

#### Local Development (`.env.local`)
- **Purpose**: Local development and testing
- **Contains**: Local development overrides and test configurations
- **Usage**: Loaded when running `npm run dev` locally
- **Security**: Never commit this file to version control

#### Required Environment Variables

```bash
# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=your_domain_or_localhost

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_neon_postgresql_connection_string

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# n8n AI Creative Analyzer Integration
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

#### Environment Setup

1. **For Production**: Use `.env` file with production values
2. **For Local Development**: Copy `.env` to `.env.local` and modify as needed
3. **Never commit sensitive files**: Both `.env` and `.env.local` are in `.gitignore`

#### Environment Validation

Use the built-in validation script to ensure your environment is properly configured:

```bash
# Validate production environment
npm run validate:env

# Setup environment files
npm run setup:env

# Test AI analysis configuration
npm run test:ai
```

#### Troubleshooting Environment Issues

- **CORS Errors**: Ensure `NEXT_PUBLIC_N8N_WEBHOOK_URL` points to the correct production endpoint
- **Missing Variables**: Run `npm run validate:env` to identify missing configuration
- **Local vs Production**: `.env.local` takes precedence over `.env` in local development
- **Server Restart**: Always restart your development server after updating environment files

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

### TypeScript
TypeScript is configured for type safety. Configuration is in `tsconfig.json`.

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev-https        # Start development server with HTTPS
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Environment Management
npm run setup:env        # Setup environment files
npm run validate:env     # Validate environment configuration
npm run test:ai          # Test AI analysis configuration

# Facebook Integration
npm run setup:facebook   # Setup Facebook configuration
npm run test:facebook    # Test Facebook API connection
```

### Adding New Features
1. Create new components in the `components/` directory
2. Add TypeScript interfaces for type safety
3. Follow the existing code structure and patterns

### Styling
- Use Tailwind CSS utility classes
- Follow the existing color scheme and design patterns
- Ensure responsive design for all screen sizes

### Data Integration
The dashboard currently uses sample data. To integrate with real Meta Ads API:

1. **Set up Meta Ads API credentials**
2. **Create API service functions**
3. **Replace sample data with API calls**
4. **Add error handling and loading states**

### AI Creative Analysis Setup

The AI analysis feature requires proper configuration of the n8n workflow:

1. **Configure n8n webhook URL** in your environment variables
2. **Ensure n8n server is running** and accessible
3. **Test webhook connectivity** using `npm run test:ai`
4. **Validate environment** using `npm run validate:env`

#### AI Analysis Workflow

1. **Select a creative** from your Facebook ads dashboard
2. **Click "Analyze Creative"** to trigger AI analysis
3. **AI processes the creative** through n8n workflow
4. **Receive insights** and performance predictions
5. **Optimize creatives** based on AI recommendations

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 