# Excel Analytics Platform

A complete platform for uploading and analyzing Excel files with interactive charts, secure authentication, and admin management.

## 🚀 Features

### Core Functionality
- **Secure Authentication** - JWT-based login for users and admins
- **Excel File Upload** - Drag-and-drop interface with Multer
- **Excel Parsing** - SheetJS integration for .xls/.xlsx files
- **Dynamic Chart Generation** - 2D charts with Chart.js
- **Interactive Visualizations** - Bar, Line, Pie, Scatter charts
- **Chart Export** - Download as PNG or PDF
- **Upload History** - Track all file uploads per user
- **Analysis History** - Save and manage chart analyses
- **Admin Dashboard** - User management and platform statistics

### Technical Stack
- **Frontend**: React.js, Chart.js, Three.js, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Multer, SheetJS
- **Authentication**: JWT tokens with role-based access
- **Security**: Helmet, rate limiting, CORS, input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd excel-analytics-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/excel-analytics
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Client URL (for CORS)
   CLIENT_URL=http://localhost:3000
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Run both server and client concurrently
npm run dev

# Or run separately:
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

### Production Mode
```bash
# Build the client
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
excel-analytics-platform/
├── server/
│   ├── models/
│   │   ├── User.js          # User model with authentication
│   │   ├── Upload.js        # File upload model
│   │   └── Analysis.js      # Chart analysis model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── upload.js        # File upload routes
│   │   ├── analysis.js      # Chart generation routes
│   │   └── admin.js         # Admin management routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   └── index.js             # Express server setup
├── client/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── services/       # API services
│   │   └── styles/         # CSS and Tailwind config
│   └── public/             # Static assets
└── uploads/                # File upload directory
```

## 🔐 Authentication

### User Roles
- **User**: Can upload files, create charts, view history
- **Admin**: All user permissions + user management, platform stats

### Default Admin Account
Create an admin user by registering with role 'admin':
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

## 📊 Chart Types

### Supported Chart Types
- **Bar Chart**: Categorical data visualization
- **Line Chart**: Time series and trends
- **Pie Chart**: Proportional data
- **Scatter Plot**: Correlation analysis

### Chart Configuration
- Dynamic column selection for X and Y axes
- Customizable chart titles and styling
- Export options (PNG/PDF)
- Interactive tooltips and legends

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### File Upload
- `POST /api/upload` - Upload Excel file
- `GET /api/upload` - Get user uploads
- `GET /api/upload/:id` - Get specific upload
- `DELETE /api/upload/:id` - Delete upload

### Analysis
- `POST /api/analysis/generate-chart` - Generate chart
- `GET /api/analysis` - Get analysis history
- `POST /api/analysis/:id/export` - Export chart
- `POST /api/analysis/:id/ai-insights` - Generate AI insights

### Admin (Admin only)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/uploads` - Upload management

## 🎨 UI Components

### Pages
- **Dashboard**: Overview with statistics and quick actions
- **Upload**: Drag-and-drop file upload interface
- **Analysis**: Chart generation and configuration
- **History**: Upload and analysis history
- **Profile**: Account management
- **Admin Dashboard**: Platform management (admin only)

### Features
- Responsive design with mobile support
- Loading states and error handling
- Toast notifications for user feedback
- Modern UI with Tailwind CSS
- Interactive charts with Chart.js

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- File type and size validation
- Role-based access control

## 📈 Future Enhancements

- **3D Charts**: Three.js integration for 3D visualizations
- **AI Integration**: Real AI insights using OpenAI API
- **Cloud Storage**: File storage on AWS S3 or similar
- **Real-time Updates**: WebSocket integration
- **Advanced Analytics**: Statistical analysis and predictions
- **Collaboration**: Shared charts and team features

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env

2. **File Upload Issues**
   - Check uploads/ directory permissions
   - Verify file size limits in .env

3. **Chart Generation Errors**
   - Ensure Excel file has valid data
   - Check column selection for numeric data

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in .env

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support


For support and questions, please open an issue on GitHub. 
