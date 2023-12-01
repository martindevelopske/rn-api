// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors=require('cors')
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const mongoUri="mongodb+srv://martindevelopske:fxX0Su2PcPTKn9rC@react-native.kflixt8.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(mongoUri);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// MongoDB Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors({allowedOrigins: '*'}))
app.use(bodyParser.json());

// Registration route
app.post('/register', async (req, res) => {
    console.log("registering user.....");
  const { username, password } = req.body;

  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'User Not Found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Password Mismatch' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
