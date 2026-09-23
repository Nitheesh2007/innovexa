const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res, next) => {
  try {
    const { range } = req.query; // 'today', 'yesterday', 'last7days', 'all'
    
    let query = {};
    const now = new Date();
    
    if (range === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      query.createdAt = { $gte: startOfDay };
    } else if (range === 'yesterday') {
      const startOfYesterday = new Date(now);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      
      const endOfYesterday = new Date(now);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      
      query.createdAt = { $gte: startOfYesterday, $lte: endOfYesterday };
    } else if (range === 'last7days') {
      const last7Days = new Date(now);
      last7Days.setDate(last7Days.getDate() - 7);
      query.createdAt = { $gte: last7Days };
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(500); // Limit to prevent massive payloads, add pagination later if needed

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
