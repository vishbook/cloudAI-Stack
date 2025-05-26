# CloudAI Stack - AI-Powered Private Cloud Management Platform

CloudAI Stack is a comprehensive private cloud management platform similar to OpenStack, enhanced with AI-powered predictive monitoring and intelligent infrastructure assistance. This platform provides a modern web interface for managing virtual machines, monitoring resources, and receiving AI-driven optimization recommendations.

## Features

### 🚀 Core Infrastructure Management
- **Virtual Machine Management**: Create, start, stop, and monitor VMs with various templates
- **Resource Monitoring**: Real-time tracking of CPU, memory, and storage usage
- **Infrastructure Dashboard**: Comprehensive overview of your cloud environment
- **Alert Management**: Centralized notification system for system events

### 🧠 AI-Powered Intelligence
- **Predictive Analytics**: AI-driven insights for capacity planning and optimization
- **Smart Recommendations**: Intelligent suggestions for resource optimization
- **Infrastructure Analysis**: Automated analysis of system performance and health
- **Optimization Suggestions**: AI-powered recommendations for cost and performance improvements

### 📊 Analytics & Reporting
- **Resource Usage Charts**: Visual representation of system metrics over time
- **Health Monitoring**: Infrastructure health scoring and status tracking
- **Performance Analytics**: Detailed analysis of system performance trends
- **Custom Dashboards**: Configurable views for different monitoring needs

## Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for API server
- **Drizzle ORM** for database operations
- **OpenAI API** for AI-powered features
- **PostgreSQL DB** for persisting data

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Shadcn/ui** for UI components
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Recharts** for data visualization

## Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **OpenAI API Key** (for AI features)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cloudai-stack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Getting an OpenAI API Key:**
1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to API section
4. Generate a new API key
5. Copy the key (starts with "sk-...")

### 4. Start the Application
```bash
npm run dev
```

The application will start on `http://localhost:5000` with both frontend and backend running concurrently.

## Application Structure

```
cloudai-stack/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utility functions and API client
│   │   └── types/         # TypeScript type definitions
├── server/                # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # In-memory data storage
│   ├── ai.ts             # AI integration with OpenAI
│   └── vite.ts           # Vite development server setup
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── package.json          # Project dependencies and scripts
```

## API Documentation

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/charts/resource-usage` - Get resource usage chart data
- `GET /api/charts/health` - Get infrastructure health data

### Virtual Machine Management
- `GET /api/vms` - List all virtual machines
- `GET /api/vms/:id` - Get specific VM details
- `POST /api/vms` - Create new virtual machine
- `PATCH /api/vms/:id` - Update VM configuration
- `DELETE /api/vms/:id` - Delete virtual machine

### Alert Management
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/unread` - Get unread alerts
- `PATCH /api/alerts/:id/read` - Mark alert as read

### AI-Powered Features
- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/analyze` - Trigger infrastructure analysis
- `POST /api/ai/optimize/:vmId` - Get VM optimization suggestions
- `PATCH /api/ai/recommendations/:id` - Update recommendation status

### System Metrics
- `GET /api/metrics/current` - Get current system metrics
- `GET /api/metrics/history` - Get historical metrics
- `POST /api/metrics/predict` - Generate resource predictions

## Usage Guide

### 1. Dashboard Overview
The main dashboard provides:
- Real-time system statistics
- AI recommendations panel
- Quick action buttons
- Resource usage charts
- Virtual machine table

### 2. Virtual Machine Management
- **Create VMs**: Use the "Create VM" button to launch new instances
- **Monitor VMs**: View real-time CPU and memory usage
- **Control VMs**: Start, stop, or put VMs in maintenance mode
- **Templates**: Choose from various OS templates (Ubuntu, CentOS, Windows)

### 3. AI Features
- **Run Analysis**: Click "Run Analysis" to get AI-powered infrastructure insights
- **View Recommendations**: Review optimization suggestions in the recommendations panel
- **Apply Suggestions**: Apply or dismiss AI recommendations as needed

### 4. Monitoring & Alerts
- **Resource Charts**: Monitor CPU, memory, and storage trends
- **Health Status**: View infrastructure health distribution
- **Alert Management**: Receive and manage system alerts

## Configuration

### Storage Configuration
The application uses in-memory storage by default for rapid development. To switch to a persistent database:

1. Update `drizzle.config.ts` with your database connection
2. Modify `server/storage.ts` to use Drizzle with your database
3. Run database migrations

### AI Configuration
AI features are powered by OpenAI's GPT-4o model. The application includes:
- Infrastructure analysis and recommendations
- VM optimization suggestions
- Predictive resource planning
- Automated capacity planning

### Customization
- **Themes**: Modify `client/src/index.css` for custom styling
- **Components**: Extend or customize components in `client/src/components/`
- **API**: Add new endpoints in `server/routes.ts`
- **Storage**: Implement custom storage backends in `server/storage.ts`

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Code Structure Guidelines
- Use TypeScript for type safety
- Follow React best practices for components
- Implement proper error handling
- Use TanStack Query for data fetching
- Maintain consistent styling with TailwindCSS

## Troubleshooting

### Common Issues

**API Key Errors:**
- Ensure your OpenAI API key is correctly set in the environment variables
- Verify the API key has sufficient credits and permissions

**Connection Issues:**
- Check that port 5000 is available
- Ensure all dependencies are installed
- Verify Node.js version compatibility

**Build Errors:**
- Clear node_modules and reinstall dependencies
- Check TypeScript configuration
- Verify all imports are correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on the repository

---

**CloudAI Stack** - Bringing AI intelligence to private cloud management.
