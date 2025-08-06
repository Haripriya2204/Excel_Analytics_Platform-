const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  sheetName: {
    type: String,
    required: true
  },
  chartType: {
    type: String,
    enum: ['bar', 'line', 'pie', 'scatter', '3d-bar', '3d-scatter'],
    required: true
  },
  xAxis: {
    column: String,
    label: String
  },
  yAxis: {
    column: String,
    label: String
  },
  chartData: {
    labels: [String],
    datasets: [{
      label: String,
      data: [mongoose.Schema.Types.Mixed],
      backgroundColor: String,
      borderColor: String,
      borderWidth: Number
    }]
  },
  chartConfig: {
    title: String,
    subtitle: String,
    showLegend: { type: Boolean, default: true },
    showGrid: { type: Boolean, default: true },
    animation: { type: Boolean, default: true }
  },
  exportHistory: [{
    format: {
      type: String,
      enum: ['png', 'pdf', 'svg']
    },
    exportedAt: {
      type: Date,
      default: Date.now
    },
    fileName: String
  }],
  aiInsights: {
    summary: String,
    trends: [String],
    recommendations: [String],
    generatedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ upload: 1 });
analysisSchema.index({ chartType: 1 });

module.exports = mongoose.model('Analysis', analysisSchema); 