const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Event routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// Attendee management
router.post('/:id/attendees', eventController.manageAttendees);

// QR code generation
router.get('/:id/qr', eventController.generateQRCode);

module.exports = router;