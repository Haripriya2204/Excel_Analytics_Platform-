const express = require('express');
const User = require('../models/User');
const Upload = require('../models/Upload');
const Analysis = require('../models/Analysis');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalUploads,
      totalAnalyses,
      storageUsed,
      recentUploads,
      chartTypeStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Upload.countDocuments(),
      Analysis.countDocuments(),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$totalStorageUsed' } } }
      ]),
      Upload.find().sort({ uploadDate: -1 }).limit(5).populate('user', 'name email'),
      Analysis.aggregate([
        { $group: { _id: '$chartType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const storageUsedMB = storageUsed[0]?.total || 0;

    res.json({
      platform: {
        totalUsers,
        activeUsers,
        totalUploads,
        totalAnalyses,
        storageUsedMB: Math.round(storageUsedMB / (1024 * 1024) * 100) / 100
      },
      recentActivity: {
        recentUploads: recentUploads.map(upload => ({
          id: upload._id,
          filename: upload.originalName,
          user: upload.user.name,
          uploadDate: upload.uploadDate
        }))
      },
      analytics: {
        chartTypeStats
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to get platform statistics' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user details with their activity
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [uploads, analyses] = await Promise.all([
      Upload.find({ user: req.params.userId }).sort({ uploadDate: -1 }).limit(10),
      Analysis.find({ user: req.params.userId }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      user,
      activity: {
        uploads,
        analyses
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user and all their data
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all user's uploads and analyses
    await Promise.all([
      Upload.deleteMany({ user: req.params.userId }),
      Analysis.deleteMany({ user: req.params.userId })
    ]);

    // Delete user
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all uploads (admin view)
router.get('/uploads', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const uploads = await Upload.find()
      .populate('user', 'name email')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-filePath');

    const total = await Upload.countDocuments();

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

// Get all analyses (admin view)
router.get('/analyses', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find()
      .populate('user', 'name email')
      .populate('upload', 'originalName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Analysis.countDocuments();

    res.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to get analyses' });
  }
});

// Delete upload (admin)
router.delete('/uploads/:uploadId', async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.uploadId);
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete file from filesystem
    const fs = require('fs');
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    // Update user's storage count
    await User.findByIdAndUpdate(upload.user, {
      $inc: { 
        uploadCount: -1,
        totalStorageUsed: -upload.fileSize
      }
    });

    // Delete related analyses
    await Analysis.deleteMany({ upload: req.params.uploadId });

    // Delete upload
    await Upload.findByIdAndDelete(req.params.uploadId);

    res.json({ message: 'Upload and related data deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
});

module.exports = router; 