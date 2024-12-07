const express = require('express');
const router = express.Router();
const ApiKey = require('../models/apiKey');
const crypto = require('crypto');
const apiAuth = require('../middleware/apiAuth');

// Generate a new API key
router.post('/generate',apiAuth, async (req, res) => {
    try {
      const newApiKey = crypto.randomBytes(32).toString('hex');
      const permissions = req.body.permissions || [];
      const description = req.body.description || '';
      const userName = req.body.userName || '';
      const userPost = req.body.userPost || '';
      const type = req.body.type || '';
      const apiKey = new ApiKey({ key: newApiKey, permissions,userName,userPost, description,type });
      await apiKey.save();
  
      res.status(201).json({ message: 'API key created successfully', apiKey: newApiKey });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

// Get all API keys (for admin use, if needed)
router.get('/',apiAuth, async (req, res) => {
  try {
    const apiKeys = await ApiKey.find();
    const apiKeysResponse = apiKeys.map(apiKey => ({
      _id: apiKey._id,
      permissions: apiKey.permissions,
      description: apiKey.description,
      type: apiKey.type,
      createdAt: apiKey.createdAt
    }));
    res.json(apiKeysResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
