# Backoffice Management System - Frontend

A React-based frontend application that integrates with the FastAPI Backoffice Management System.

## Features

- 🔐 **JWT Authentication** - Secure login/logout with token management
- 👥 **Role-Based Access** - Sales Executive and Pricing Analyst dashboards
- 📋 **Pricing Request Management** - Complete CRUD operations
- 🎨 **Modern UI** - Material-UI components with responsive design
- 🔄 **Real-time Updates** - React Query for efficient data management
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript
- **UI Framework**: Material-UI (MUI)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Package Manager**: npm

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

### 3. Backend Integration

Make sure your FastAPI backend is running on `http://localhost:8080` before using the frontend.

## User Workflows

### Sales Executive Workflow

1. **Login** - Use Sales Executive credentials
2. **Dashboard** - View all pricing requests with status filtering
3. **Create PR** - Create new pricing requests (save as draft or submit for review)
4. **View Details** - Click on any PR to view complete details
5. **Edit/Delete** - Modify draft PRs or delete them
6. **Resubmit** - Update action-required PRs and resubmit

### Pricing Analyst Workflow

1. **Login** - Use Pricing Analyst credentials
2. **Available PRs** - View all pricing requests available for assignment
3. **Assign** - Click assign button to take ownership of a PR
4. **My PRs** - View assigned pricing requests
5. **Review** - View PR details and approve/reject/request action
6. **Comments** - Add comments when rejecting or requesting action

## API Integration

The frontend integrates with the following FastAPI endpoints:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Sales Executive Endpoints

- `POST /sales/pr/save` - Save PR as draft
- `POST /sales/pr/submit` - Submit PR for review
- `GET /sales/pr` - Get all PRs
- `GET /sales/pr/{id}` - Get PR details
- `PUT /sales/pr/{id}` - Update PR
- `DELETE /sales/pr/{id}` - Delete PR
- `POST /sales/pr/{id}/resubmit` - Resubmit action-required PR

### Pricing Analyst Endpoints

- `GET /pa/pr` - Get available PRs
- `GET /pa/pr/my` - Get assigned PRs
- `GET /pa/pr/{id}` - Get PR details
- `POST /pa/pr/{id}/assign` - Assign PR to self
- `POST /pa/pr/{id}/approve-reject` - Approve/reject/request action

## Demo Accounts

### Sales Executive Accounts

- **Email**: john.smith@company.com
- **Password**: 123456

- **Email**: michael.chen@company.com
- **Password**: 123456

- **Email**: david.wilson@company.com
- **Password**: 123456

### Pricing Analyst Accounts

- **Email**: sarah.analyst@company.com
- **Password**: 123456

- **Email**: emily.rodriguez@company.com
- **Password**: 123456

- **Email**: lisa.thompson@company.com
- **Password**: 123456

## Project Structure

```
src/
├── component/           # Reusable UI components
│   ├── DashboardLayout.tsx
│   ├── PRForm.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/             # Page components
│   ├── AuthPage.tsx
│   ├── SalesDashboard.tsx
│   ├── AnalystDashboard.tsx
│   └── PRDetailsPage.tsx
├── services/          # API services
│   ├── api.ts
│   └── prService.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
└── App.tsx           # Main application component
```

## Key Features

### Authentication & Authorization

- JWT token-based authentication
- Automatic token storage and retrieval
- Role-based route protection
- Automatic logout on token expiration

### Pricing Request Management

- **Create**: Sales executives can create new pricing requests
- **Save as Draft**: Save work in progress
- **Submit for Review**: Send to pricing analysts
- **View Details**: Complete PR information with items and comments
- **Edit**: Modify draft PRs
- **Delete**: Remove draft PRs
- **Resubmit**: Update action-required PRs

### Pricing Analyst Workflow

- **Available PRs**: View all PRs available for assignment
- **Assign**: Take ownership of pricing requests
- **My PRs**: View assigned pricing requests
- **Review**: Approve, reject, or request additional information
- **Comments**: Add detailed comments for decisions

### Status Management

- **Draft**: Initial state when saved
- **Under Review**: When submitted for review
- **Action Required**: Needs attention from sales
- **Approved**: Final approval by PA
- **Rejected**: Rejected by PA
- **Closed**: Completed

## Development

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### API Configuration

The API configuration is in `src/config/api.ts`. Update the `BASE_URL` to point to your FastAPI backend:

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:8080",
  // ... other config
};
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your FastAPI backend has CORS properly configured:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Authentication Issues

- Clear browser localStorage if tokens are corrupted
- Check that the backend is running on the correct port
- Verify JWT token expiration settings

### API Connection Issues

- Ensure the backend is running on `http://localhost:8080`
- Check network connectivity
- Verify API endpoint URLs in the configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
