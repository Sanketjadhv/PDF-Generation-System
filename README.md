## 🎯 Project Overview

This is a **Dynamic PDF Template Generation System** that allows users to:
- Create custom PDF templates with Header, Body, and Footer sections
- Map template fields to JSON paths in the database
- Generate PDFs dynamically using template structures and user data
- Support multiple alignment options (Left, Center, Right)

**Technology Stack:**
- **Backend**: Python (Flask)
- **Frontend**: React Native (Expo)
- **Database**: MongoDB
- **PDF Generation**: ReportLab

---

## 📦 Prerequisites

Before starting, ensure you have the following installed:

### Required Software:

1. **Python 3.7 or higher**
   - Download from: https://www.python.org/downloads/
   - Verify installation: `python --version`

2. **Node.js 14 or higher**
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

3. **MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Install and start MongoDB service
   - Verify: MongoDB should be running on `localhost:27017`

4. **Git** (Optional)
   - For version control

5. **Code Editor**
   - VS Code, Cursor, or any preferred IDE

## 📁 Project Structure

```
pdf_project1/
│
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── seed_templates.py      # Script to seed sample templates
│   └── venv/                  # Python virtual environment
│
├── frontend/
│   └── PdfGeneratorApp/
│       ├── screens/
│       │   ├── App.js                    # Main navigation component
│       │   ├── CreateTemplateScreen.js   # Template creation screen
│       │   └── PreviewScreen.js          # PDF preview and generation
│       ├── config.js                     # API configuration
│       ├── package.json                  # Node dependencies
│       └── app/                          # Expo router files
│
├── README.md                    # Main project readme




## 🔑 Key Files Explained

### Backend Files

**`app.py`**
- Main Flask server
- API endpoints for templates, users, PDF generation
- MongoDB connection and data handling
- PDF generation logic using ReportLab

**`seed_templates.py`**
- Script to populate database with sample templates
- Run once to create example templates

### Frontend Files

**`App.js`**
- Main navigation component
- Switches between Template Creation and PDF Preview screens

**`CreateTemplateScreen.js`**
- Template creation interface
- Handles Header/Body/Footer sections
- Field management (add/remove/update)
- Alignment selection

**`PreviewScreen.js`**
- Template selection dropdown
- User selection (for Salary templates)
- PDF generation and download

**`config.js`**
- API URL configuration
- Change this based on environment (web/device)


## 🚀 Quick Start Checklist

- [ ] MongoDB installed and running
- [ ] Python 3.7+ installed
- [ ] Node.js 14+ installed
- [ ] Backend dependencies installed (`pip install flask flask-cors pymongo reportlab`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] API URL configured in `config.js`
- [ ] Backend server running on port 5000
- [ ] Frontend server running (Expo)
- [ ] Sample templates seeded (optional)
- [ ] Application accessible in browser/device


## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend shows: "Server is running and connected to MongoDB!"
✅ Frontend shows templates in dropdown
✅ You can create and save templates
✅ PDFs generate successfully
✅ PDFs download/open correctly
✅ Alignment works in generated PDFs


## 📝 Notes

- Template names are **case-sensitive**
- JSON paths use **dot notation** (not arrows or brackets)
- Default values are used when mapping fields don't exist
- Salary templates automatically show user dropdown
- PDFs are generated with ReportLab library
- All data is stored in MongoDB

---

**Last Updated**: December 2025
**Version**: 1.0.0





