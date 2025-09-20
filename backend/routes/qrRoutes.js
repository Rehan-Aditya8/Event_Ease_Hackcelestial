const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply authentication middleware
router.use(verifyToken);

// QR code routes
router.post('/generate', qrController.generateQR);
router.post('/validate', qrController.validateQR);

module.exports = router;