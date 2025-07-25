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

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
agency-dashboard/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/            # React components
│   └── MetaDashboard.tsx # Main dashboard component
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

### TypeScript
TypeScript is configured for type safety. Configuration is in `tsconfig.json`.

## Development

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