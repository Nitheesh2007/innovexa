const Tesseract = require('tesseract.js');
const fs = require('fs');

exports.extractProductData = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    
    // Run OCR
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );

    // Clean up file after OCR
    fs.unlinkSync(imagePath);

    // Basic heuristic parsing
    // In a real-world scenario, you might pass this text to an LLM for structured extraction
    const extractedData = {
      productName: '',
      price: '',
      sku: '',
      rawText: text
    };

    const lines = text.split('\n').filter(l => l.trim() !== '');
    
    // Very rudimentary parser just to demonstrate extraction
    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('price') || lower.includes('$') || lower.includes('₹')) {
        const match = line.match(/[\d,.]+/);
        if (match) extractedData.price = match[0];
      } else if (lower.includes('sku') || lower.includes('item no')) {
        const match = line.match(/(?:sku|item no)[\s:]*([A-Za-z0-9-]+)/i);
        if (match) extractedData.sku = match[1];
      } else if (!extractedData.productName && line.length > 3) {
        extractedData.productName = line.trim();
      }
    });

    res.status(200).json({
      success: true,
      message: 'OCR Extraction complete',
      data: extractedData
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
