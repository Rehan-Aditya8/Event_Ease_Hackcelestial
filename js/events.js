/**
 * Events management with Firestore
 */

import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Event management class
class EventManager {
  constructor() {
    this.eventsCollection = collection(db, "events");
  }

  // Create a new event
  async createEvent(eventData) {
    try {
      // Add creator ID to event data
      const eventWithCreator = {
        ...eventData,
        creatorId: auth.currentUser.uid,
        createdAt: new Date(),
        attendees: []
      };
      
      const docRef = await addDoc(this.eventsCollection, eventWithCreator);
      return { id: docRef.id, ...eventWithCreator };
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  // Get all events created by current user
  async getUserEvents() {
    try {
      const userId = auth.currentUser.uid;
      const q = query(this.eventsCollection, where("creatorId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      
      return events;
    } catch (error) {
      console.error("Error getting user events:", error);
      throw error;
    }
  }

  // Get all public events
  async getPublicEvents() {
    try {
      const q = query(this.eventsCollection, where("isPublic", "==", true));
      const querySnapshot = await getDocs(q);
      
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      
      return events;
    } catch (error) {
      console.error("Error getting public events:", error);
      throw error;
    }
  }

  // Update an event
  async updateEvent(eventId, eventData) {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, eventData);
      return { id: eventId, ...eventData };
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId) {
    try {
      await deleteDoc(doc(db, "events", eventId));
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  // Register user for an event
  async registerForEvent(eventId) {
    try {
      const userId = auth.currentUser.uid;
      const eventRef = doc(db, "events", eventId);
      
      // Get current event data
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }
      
      const eventData = eventDoc.data();
      const attendees = eventData.attendees || [];
      
      // Check if user is already registered
      if (attendees.includes(userId)) {
        throw new Error("User already registered for this event");
      }
      
      // Add user to attendees
      attendees.push(userId);
      await updateDoc(eventRef, { attendees });
      
      return true;
    } catch (error) {
      console.error("Error registering for event:", error);
      throw error;
    }
  }
}

export const eventManager = new EventManager();