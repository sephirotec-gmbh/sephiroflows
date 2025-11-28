# SephiroFlows - Phase 1 MVP

## Workflow Automation Platform

SephiroFlows is a powerful workflow automation platform that enables you to create, manage, and execute complex workflows with a visual node-based editor.

### 🎯 Phase 1 Features

#### ✅ Core Functionality
- **Visual Workflow Editor**: Drag-and-drop interface powered by React Flow
- **Authentication System**: Secure email/password authentication with JWT
- **Workflow Management**: Create, update, delete, and organize workflows
- **Workflow Execution**: Synchronous execution engine with detailed logging
- **Expression Evaluator**: Dynamic value evaluation with `{{$node.x.data}}` syntax
- **Built-in Nodes**: 6 essential nodes to get started

#### 🔧 Built-in Nodes
1. **Manual Trigger** - Manually start workflows
2. **HTTP Request** - Make API calls (GET, POST, PUT, DELETE, PATCH)
3. **Data Transform** - Transform and map data
4. **Conditional Logic** - Branch workflows based on conditions
5. **Set Variable** - Store and retrieve workflow variables
6. **Send Email** - Send emails via SMTP

### 🏗️ Technology Stack

#### Backend
- **Node.js 20+** with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL 15+** - Primary database
- **Redis 7+** - Session storage
- **JWT** - Authentication
- **Nodemailer** - Email sending
- **Axios** - HTTP client

#### Frontend
- **React 18** with **TypeScript**
- **Vite** - Build tool
- **React Flow** - Visual workflow editor
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ and **npm** 8+
- **Docker** and **Docker Compose** (for PostgreSQL and Redis)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd sephiroflows
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

3. **Configure environment variables**
```bash
# Copy example env files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit backend/.env with your settings
# IMPORTANT: Update SMTP settings if you want to use Send Email node
```

4. **Start Docker services (PostgreSQL & Redis)**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
cd backend
npm run migrate
```

6. **Start the application**
```bash
# From root directory
npm run dev
```

This will start:
- **Backend API**: http://localhost:3000
- **Frontend UI**: http://localhost:5173

### 🎬 Demo Credentials

- **Email**: demo@sephiroflows.app
- **Password**: demo123

## 📖 Usage Guide

### 1. Creating Your First Workflow

1. **Login** to the application at http://localhost:5173
2. Navigate to **Workflows** from the sidebar
3. Click **New Workflow**
4. Drag nodes from the **Node Library** onto the canvas
5. Connect nodes by dragging from output to input ports
6. Click on a node to configure its parameters
7. Use expressions like `{{$node.node_1.data.field}}` to reference previous node outputs
8. Click **Save** to save your workflow
9. Click **Execute** to run it

### 2. Node Configuration

Each node has configurable parameters that appear in the **Node Configuration Panel** when you select a node:

#### HTTP Request Node
```json
{
  "method": "GET",
  "url": "https://api.example.com/data",
  "headers": {
    "Authorization": "Bearer {{$variables.apiKey}}"
  }
}
```

#### Conditional Node
```json
{
  "condition": "{{$node.http_node.data.status}}",
  "operator": "equals",
  "value": "200"
}
```

#### Send Email Node
```json
{
  "to": "user@example.com",
  "subject": "Workflow Notification",
  "body": "Status: {{$node.http_node.data.statusText}}",
  "isHtml": false
}
```

### 3. Expression System

SephiroFlows supports powerful expressions for dynamic values:

#### Accessing Node Data
- `{{$node.node_id.data.field}}` - Access specific field from a node's output
- `{{$node.http_1.data.status}}` - Get HTTP status from a previous node

#### Accessing Trigger Data
- `{{$trigger.data}}` - Access all trigger data
- `{{$trigger.data.email}}` - Access specific trigger field

#### Using Variables
- `{{$variables.myVar}}` - Access workflow variable

#### Built-in Functions
- `{{$now()}}` - Current timestamp
- `{{$uppercase(value)}}` - Convert to uppercase
- `{{$lowercase(value)}}` - Convert to lowercase
- `{{$length(array)}}` - Get array/string length
- `{{$json(string)}}` - Parse JSON string

### 4. Execution & Monitoring

- View all workflow executions in the **Executions** page
- Click on any execution to see detailed logs
- Each node execution shows:
  - Status (success/failed/running)
  - Execution time
  - Input/output data
  - Error messages (if failed)

## 🗂️ Project Structure

```
sephiroflows/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database & Redis config
│   │   ├── controllers/    # API controllers
│   │   ├── engine/         # Workflow execution engine
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # (Future: Database models)
│   │   ├── nodes/          # Built-in node implementations
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── migrations/         # Database migrations
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── docs/                   # Documentation
├── docker-compose.yml      # Docker services
└── package.json           # Root package.json

```

## 🔌 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "companyName": "Acme Inc"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    ...
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Workflows

#### List Workflows
```http
GET /api/workflows?status=active&limit=50&offset=0
Authorization: Bearer <token>
```

#### Get Workflow
```http
GET /api/workflows/:id
Authorization: Bearer <token>
```

#### Create Workflow
```http
POST /api/workflows
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Description here",
  "nodes": [],
  "edges": [],
  "settings": {}
}
```

#### Update Workflow
```http
PUT /api/workflows/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "nodes": [...],
  "edges": [...]
}
```

#### Execute Workflow
```http
POST /api/workflows/:id/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "triggerData": {
    "email": "test@example.com"
  }
}
```

#### Delete Workflow
```http
DELETE /api/workflows/:id
Authorization: Bearer <token>
```

### Executions

#### List Executions
```http
GET /api/executions?workflowId=uuid&status=success&limit=50
Authorization: Bearer <token>
```

#### Get Execution
```http
GET /api/executions/:id
Authorization: Bearer <token>
```

#### Get Execution Logs
```http
GET /api/executions/:id/logs
Authorization: Bearer <token>
```

### Nodes

#### List Available Nodes
```http
GET /api/nodes?category=action
Authorization: Bearer <token>
```

#### Get Node Definition
```http
GET /api/nodes/:type
Authorization: Bearer <token>
```

## 🔧 Configuration

### Backend Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sephiroflows
DB_USER=sephiro
DB_PASSWORD=sephiro_dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# SMTP (for Send Email node)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Credentials Encryption (64-char hex)
CREDENTIAL_ENCRYPTION_KEY=0123...

# Execution Limits
MAX_EXECUTION_TIME_MS=300000
MAX_NODES_PER_WORKFLOW=50
```

### SMTP Setup for Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASSWORD`

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset everything (WARNING: deletes all data)
docker-compose down -v
```

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd backend
npm test

# Frontend tests (coming soon)
cd frontend
npm test
```

## 📝 Development Notes

### Database Migrations

To create a new migration:
```bash
cd backend
# Add SQL to migrations/ directory
# Run migration
npm run migrate
```

### Adding New Nodes

1. Create node implementation in `backend/src/nodes/`
2. Add node definition to database migration
3. Register in `backend/src/engine/NodeExecutor.ts`

Example node:
```typescript
// backend/src/nodes/MyCustomNode.ts
import { ExecutionContext } from '../types';

export class MyCustomNode {
  async execute(parameters: any, context: ExecutionContext): Promise<any> {
    // Node logic here
    return {
      result: 'success',
      data: parameters
    };
  }
}
```

## 🚧 Roadmap - Future Phases

### Phase 2
- BullMQ queue system for async execution
- Webhook triggers
- Schedule triggers (cron)
- Real-time execution updates (WebSocket)
- Credential management system

### Phase 3
- Multi-tenancy with database routing
- OAuth2 integrations
- Node marketplace
- Workflow templates
- Advanced monitoring & alerts

### Phase 4
- RegioBooster integration
- Custom code nodes
- Workflow versioning
- A/B testing capabilities
- Enterprise features

## ⚠️ Important Notes

### Localhost Reference
**This localhost refers to localhost of the computer that I'm using to run the application, not your local machine.** To access it locally or remotely, you'll need to deploy the application on your own system following the installation instructions above.

### Security Considerations
- Change all default passwords and secrets in production
- Use HTTPS in production
- Set up proper CORS policies
- Implement rate limiting
- Regular security audits
- Keep dependencies updated

### Performance Tips
- PostgreSQL connection pooling is configured (max 20 connections)
- Redis is used for session storage
- Frontend uses React Query for caching
- Use pagination for large result sets

## 🤝 Contributing

(Add contribution guidelines when ready)

## 📄 License

MIT License

## 🆘 Support

For issues or questions:
- Check the documentation in `/docs`
- Review the technical blueprint
- Check existing GitHub issues
- Create a new issue with detailed information

## 👥 Credits

Built by the SephiroFlows team with ❤️

---

**Phase 1 MVP - November 2025**
