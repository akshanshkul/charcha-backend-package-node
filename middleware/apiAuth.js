// middleware/apiAuth.js
const ApiKey = require('../models/ApiKey');

const apiAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const isValid = await ApiKey.verifyKey(token);

    if (isValid) {
      next();
    } else {
      res.status(401).json({ message: 'Invalid API key' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = apiAuth;
