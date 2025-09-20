const admin = require('../config/firebase-admin');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const db = admin.firestore();
const eventsCollection = db.collection('events');

// Generate secure QR code
const generateQR = async (req, res) => {
  try {
    const { eventId, userId } = req.body;
    
    if (!eventId || !userId) {
      return res.status(400).json({ error: 'eventId and userId are required' });
    }
    
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Generate a unique token
    const token = uuidv4();
    const timestamp = Date.now();
    
    // Store QR data in Firestore
    const qrData = {
      eventId,
      userId,
      token,
      timestamp,
      used: false
    };
    
    await db.collection('qrcodes').doc(token).set(qrData);
    
    // Generate QR code with the token
    const qrCodeData = JSON.stringify({
      token,
      eventId,
      userId,
      timestamp
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    
    res.status(200).json({
      qrCode: qrCodeImage,
      token
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: error.message });
  }
};

// Validate QR code for event entry
const validateQR = async (req, res) => {
  try {
    const { token, eventId } = req.body;
    
    if (!token || !eventId) {
      return res.status(400).json({ error: 'token and eventId are required' });
    }
    
    // Get QR code data from Firestore
    const qrDoc = await db.collection('qrcodes').doc(token).get();
    
    if (!qrDoc.exists) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    const qrData = qrDoc.data();
    
    // Check if QR code is for the correct event
    if (qrData.eventId !== eventId) {
      return res.status(400).json({ error: 'QR code is not valid for this event' });
    }
    
    // Check if QR code has already been used
    if (qrData.used) {
      return res.status(400).json({ error: 'QR code has already been used' });
    }
    
    // Check if QR code is expired (24 hours)
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - qrData.timestamp > expirationTime) {
      return res.status(400).json({ error: 'QR code has expired' });
    }
    
    // Mark QR code as used
    await db.collection('qrcodes').doc(token).update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add user to event attendees if not already added
    const eventDoc = await eventsCollection.doc(eventId).get();
    const eventData = eventDoc.data();
    const attendees = eventData.attendees || [];
    
    if (!attendees.includes(qrData.userId)) {
      await eventsCollection.doc(eventId).update({
        attendees: admin.firestore.FieldValue.arrayUnion(qrData.userId)
      });
    }
    
    res.status(200).json({
      valid: true,
      message: 'QR code validated successfully',
      userId: qrData.userId
    });
  } catch (error) {
    console.error('Error validating QR code:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateQR,
  validateQR
};