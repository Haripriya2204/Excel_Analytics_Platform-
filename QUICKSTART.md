# Quick Start Guide

Get the Excel Analytics Platform running in 5 minutes!

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js (v14+) installed
- MongoDB running locally or cloud instance

### 2. One-Command Setup
```bash
# Run the automated setup
npm run setup
```

### 3. Configure Environment
Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/excel-analytics
JWT_SECRET=your-secret-key-here
```

### 4. Start the Application
```bash
# Start both server and client
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👤 First Time Setup

### Create Admin Account
1. Go to http://localhost:3000/register
2. Register with role "admin":
   ```
   Name: Admin User
   Email: admin@example.com
   Password: admin123
   Role: admin
   ```

### Create Regular User
1. Go to http://localhost:3000/register
2. Register with role "user" (default)

## 📊 Test the Platform

### 1. Upload Excel File
- Go to Upload page
- Drag & drop an Excel file (.xls/.xlsx)
- File should have headers and data

### 2. Create Charts
- Go to Analysis page
- Select your uploaded file
- Choose sheet and columns
- Generate charts (Bar, Line, Pie, Scatter)

### 3. Export Charts
- Click export buttons (PNG/PDF)
- Charts download to your device

### 4. Admin Features
- Login as admin
- Access Admin Dashboard
- Manage users and view platform stats

## 🔧 Troubleshooting

### MongoDB Issues
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Port Issues
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5000

# Kill processes if needed
kill -9 <PID>
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Client dependencies
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📁 Sample Excel Files

Create test files with this structure:
```
Name    | Age | Salary | Department
John    | 25  | 50000  | IT
Jane    | 30  | 60000  | HR
Bob     | 35  | 70000  | Sales
```

## 🎯 Next Steps

1. **Explore Features**: Try all chart types and export options
2. **Customize**: Modify colors, themes, and styling
3. **Extend**: Add new chart types or integrations
4. **Deploy**: Set up for production use

## 📞 Need Help?

- Check the full README.md for detailed documentation
- Review the code structure in server/ and client/ folders
- Open an issue for bugs or feature requests

---

**Happy Analyzing! 📈** 