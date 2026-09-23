const Suggestion = require('../models/Suggestion');

exports.createSuggestion = async (req, res) => {
  try {
    const { title, description, type, priority, attachment } = req.body;
    const suggestion = await Suggestion.create({
      title,
      description,
      type: type || 'Suggestion',
      priority: priority || 'Medium',
      attachment: attachment || null,
      submittedBy: req.user.id
    });
    res.status(201).json({ success: true, data: suggestion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update status' });
    }

    const updateData = { status };
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
    }

    const suggestion = await Suggestion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }
    
    res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.upvoteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = await Suggestion.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }
    
    res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
