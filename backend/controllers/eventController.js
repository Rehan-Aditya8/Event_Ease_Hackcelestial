const admin = require('../config/firebase-admin');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const db = admin.firestore();
const eventsCollection = db.collection('events');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const eventsSnapshot = await eventsCollection.get();
    const events = [];
    
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json({
      id: eventDoc.id,
      ...eventDoc.data()
    });
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const { name, description, date, location, capacity, organizerId } = req.body;
    
    // Validate required fields
    if (!name || !date || !organizerId) {
      return res.status(400).json({ error: 'Name, date, and organizerId are required' });
    }
    
    const eventData = {
      name,
      description: description || '',
      date,
      location: location || '',
      capacity: capacity || 100,
      organizerId,
      attendees: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const eventRef = await eventsCollection.add(eventData);
    
    res.status(201).json({
      id: eventRef.id,
      ...eventData
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, date, location, capacity } = req.body;
    
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (req.user.uid !== eventDoc.data().organizerId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only the organizer can update this event' });
    }
    
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(date && { date }),
      ...(location && { location }),
      ...(capacity && { capacity }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await eventsCollection.doc(eventId).update(updateData);
    
    res.status(200).json({
      id: eventId,
      ...eventDoc.data(),
      ...updateData
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (req.user.uid !== eventDoc.data().organizerId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only the organizer can delete this event' });
    }
    
    await eventsCollection.doc(eventId).delete();
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
};

// Manage event attendees
const manageAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId, action } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }
    
    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Action must be either "add" or "remove"' });
    }
    
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const eventData = eventDoc.data();
    const attendees = eventData.attendees || [];
    
    if (action === 'add') {
      // Check if attendee already exists
      if (attendees.includes(userId)) {
        return res.status(400).json({ error: 'User is already an attendee' });
      }
      
      // Check capacity
      if (attendees.length >= eventData.capacity) {
        return res.status(400).json({ error: 'Event has reached maximum capacity' });
      }
      
      await eventsCollection.doc(eventId).update({
        attendees: admin.firestore.FieldValue.arrayUnion(userId)
      });
    } else {
      // Remove attendee
      if (!attendees.includes(userId)) {
        return res.status(400).json({ error: 'User is not an attendee' });
      }
      
      await eventsCollection.doc(eventId).update({
        attendees: admin.firestore.FieldValue.arrayRemove(userId)
      });
    }
    
    const updatedEventDoc = await eventsCollection.doc(eventId).get();
    
    res.status(200).json({
      id: updatedEventDoc.id,
      ...updatedEventDoc.data()
    });
  } catch (error) {
    console.error('Error managing attendees:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate QR code for event
const generateQRCode = async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventDoc = await eventsCollection.doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Generate a unique token for this event
    const qrToken = uuidv4();
    
    // Store the token in the event document
    await eventsCollection.doc(eventId).update({
      qrToken,
      qrGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Generate QR code
    const qrCodeData = JSON.stringify({
      eventId,
      token: qrToken
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    
    res.status(200).json({
      eventId,
      qrCode: qrCodeImage
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  manageAttendees,
  generateQRCode
};