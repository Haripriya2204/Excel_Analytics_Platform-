const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const Upload = require('../models/Upload');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ];
  
  const allowedExtensions = ['.xls', '.xlsx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload Excel file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const filePath = file.path;

    // Parse Excel file
    let workbook;
    try {
      workbook = XLSX.readFile(filePath);
    } catch (error) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Invalid Excel file format' });
    }

    const sheets = [];
    const sheetNames = workbook.SheetNames;

    // Process each sheet
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) continue;

      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      // Store first 100 rows for preview (to avoid large data storage)
      const previewData = dataRows.slice(0, 100);

      sheets.push({
        name: sheetName,
        rowCount: dataRows.length,
        columnCount: headers.length,
        headers: headers,
        data: previewData
      });
    }

    if (sheets.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No valid data found in Excel file' });
    }

    // Create upload record
    const upload = new Upload({
      user: req.user._id,
      filename: file.filename,
      originalName: file.originalname,
      filePath: filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'processed',
      sheets: sheets
    });

    await upload.save();

    // Update user's upload count and storage used
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        uploadCount: 1,
        totalStorageUsed: file.size
      }
    });

    res.status(201).json({
      message: 'File uploaded and processed successfully',
      upload: {
        id: upload._id,
        filename: upload.filename,
        originalName: upload.originalName,
        fileSize: upload.fileSize,
        status: upload.status,
        sheets: upload.sheets,
        uploadDate: upload.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it was uploaded
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    if (error.message.includes('Only Excel files')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get user's uploads
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const uploads = await Upload.find({ user: req.user._id })
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-filePath');

    const total = await Upload.countDocuments({ user: req.user._id });

    res.json({
      uploads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ error: 'Failed to get uploads' });
  }
});

// Get specific upload
router.get('/:uploadId', authenticateToken, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.uploadId,
      user: req.user._id
    }).select('-filePath');

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    res.json({ upload });
  } catch (error) {
    console.error('Get upload error:', error);
    res.status(500).json({ error: 'Failed to get upload' });
  }
});

// Delete upload
router.delete('/:uploadId', authenticateToken, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.uploadId,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    // Update user's storage count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        uploadCount: -1,
        totalStorageUsed: -upload.fileSize
      }
    });

    await Upload.findByIdAndDelete(req.params.uploadId);

    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
});

module.exports = router; 