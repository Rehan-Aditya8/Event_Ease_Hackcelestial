const admin = require('../config/firebase-admin');

// Handle user registration
const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });
    
    // Set custom claims for role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      uid: userRecord.uid 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Handle user login (verify token)
const login = async (req, res) => {
  try {
    // The actual authentication is handled by Firebase on the client side
    // This endpoint is for additional server-side validation if needed
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user details
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: decodedToken.role || 'user'
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Verify Firebase JWT token
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    return res.status(200).json({
      valid: true,
      uid: decodedToken.uid,
      role: decodedToken.role || 'user'
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ valid: false, error: 'Invalid token' });
  }
};

module.exports = {
  register,
  login,
  verifyToken
};