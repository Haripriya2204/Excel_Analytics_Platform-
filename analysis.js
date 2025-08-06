const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Analysis = require('../models/Analysis');
const Upload = require('../models/Upload');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Generate chart from uploaded data
router.post('/generate-chart', authenticateToken, async (req, res) => {
  try {
    const { uploadId, sheetName, chartType, xAxis, yAxis, chartConfig } = req.body;

    // Get upload data
    const upload = await Upload.findOne({
      _id: uploadId,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Find the specified sheet
    const sheet = upload.sheets.find(s => s.name === sheetName);
    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    // Get column indices
    const xAxisIndex = sheet.headers.indexOf(xAxis);
    const yAxisIndex = sheet.headers.indexOf(yAxis);

    if (xAxisIndex === -1 || yAxisIndex === -1) {
      return res.status(400).json({ error: 'Invalid axis selection' });
    }

    // Process data for chart
    const chartData = processChartData(sheet.data, xAxisIndex, yAxisIndex, chartType);

    // Create analysis record
    const analysis = new Analysis({
      user: req.user._id,
      upload: uploadId,
      sheetName,
      chartType,
      xAxis: {
        column: xAxis,
        label: xAxis
      },
      yAxis: {
        column: yAxis,
        label: yAxis
      },
      chartData,
      chartConfig: chartConfig || {
        title: `${yAxis} vs ${xAxis}`,
        subtitle: `Chart from ${upload.originalName}`,
        showLegend: true,
        showGrid: true,
        animation: true
      }
    });

    await analysis.save();

    res.status(201).json({
      message: 'Chart generated successfully',
      analysis: {
        id: analysis._id,
        chartType: analysis.chartType,
        chartData: analysis.chartData,
        chartConfig: analysis.chartConfig,
        createdAt: analysis.createdAt
      }
    });

  } catch (error) {
    console.error('Chart generation error:', error);
    res.status(500).json({ error: 'Chart generation failed' });
  }
});

// Get user's analysis history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ user: req.user._id })
      .populate('upload', 'originalName filename')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Analysis.countDocuments({ user: req.user._id });

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

// Get specific analysis
router.get('/:analysisId', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      user: req.user._id
    }).populate('upload', 'originalName filename');

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

// Export chart as image/PDF
router.post('/:analysisId/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'png' } = req.body;

    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // For now, we'll return the chart data for client-side export
    // In a production environment, you might want to generate the image server-side
    const exportData = {
      format,
      chartData: analysis.chartData,
      chartConfig: analysis.chartConfig,
      chartType: analysis.chartType,
      fileName: `chart-${analysis._id}.${format}`
    };

    // Update export history
    analysis.exportHistory.push({
      format,
      exportedAt: new Date(),
      fileName: exportData.fileName
    });

    await analysis.save();

    res.json({
      message: 'Export data prepared',
      exportData
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Generate AI insights (optional feature)
router.post('/:analysisId/ai-insights', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      user: req.user._id
    }).populate('upload');

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Mock AI insights (replace with actual AI API integration)
    const insights = generateMockInsights(analysis);

    // Update analysis with AI insights
    analysis.aiInsights = {
      ...insights,
      generatedAt: new Date()
    };

    await analysis.save();

    res.json({
      message: 'AI insights generated',
      insights: analysis.aiInsights
    });

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'AI insights generation failed' });
  }
});

// Delete analysis
router.delete('/:analysisId', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    await Analysis.findByIdAndDelete(req.params.analysisId);

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// Helper function to process chart data
function processChartData(data, xAxisIndex, yAxisIndex, chartType) {
  const labels = [];
  const values = [];

  data.forEach(row => {
    if (row[xAxisIndex] !== undefined && row[yAxisIndex] !== undefined) {
      labels.push(String(row[xAxisIndex]));
      values.push(parseFloat(row[yAxisIndex]) || 0);
    }
  });

  // Generate colors for different chart types
  const colors = generateColors(values.length);

  return {
    labels,
    datasets: [{
      label: 'Data',
      data: values,
      backgroundColor: chartType === 'pie' ? colors : colors[0],
      borderColor: chartType === 'pie' ? colors : colors[0],
      borderWidth: 1
    }]
  };
}

// Helper function to generate colors
function generateColors(count) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = colors.length; i < count; i++) {
    additionalColors.push(`hsl(${(i * 137.5) % 360}, 70%, 50%)`);
  }
  
  return [...colors, ...additionalColors];
}

// Helper function to generate mock AI insights
function generateMockInsights(analysis) {
  const data = analysis.chartData.datasets[0].data;
  const labels = analysis.chartData.labels;
  
  const maxValue = Math.max(...data);
  const minValue = Math.max(...data);
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length;
  const maxIndex = data.indexOf(maxValue);
  
  return {
    summary: `Analysis of ${analysis.yAxis.label} data shows ${data.length} data points with an average of ${avgValue.toFixed(2)}.`,
    trends: [
      `Highest value: ${maxValue} (${labels[maxIndex]})`,
      `Lowest value: ${minValue}`,
      `Average: ${avgValue.toFixed(2)}`
    ],
    recommendations: [
      'Consider focusing on periods with higher values',
      'Look for patterns in the data distribution',
      'Monitor for any outliers or anomalies'
    ]
  };
}

module.exports = router; 