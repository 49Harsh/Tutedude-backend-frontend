const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
},
  password: { 
    type: String, 
    required: true 
},
  friends: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
}],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
}]
});

const User = mongoose.model('User', UserSchema);

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes


app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid login credentials');
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/friend-request', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).send('User not found');
    }
    if (friend.friendRequests.includes(req.user._id)) {
      return res.status(400).send('Friend request already sent');
    }
    friend.friendRequests.push(req.user._id);
    await friend.save();
    res.send('Friend request sent');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/accept-friend', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    req.user.friends.push(friendId);
    req.user.friendRequests = req.user.friendRequests.filter(id => id.toString() !== friendId);
    await req.user.save();
    const friend = await User.findById(friendId);
    friend.friends.push(req.user._id);
    await friend.save();
    res.send('Friend request accepted');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username');
    res.send(user.friends);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/friend-requests', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate('friendRequests', 'username');
      res.send(user.friendRequests);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  app.post('/reject-friend', auth, async (req, res) => {
    try {
      const { friendId } = req.body;
      req.user.friendRequests = req.user.friendRequests.filter(id => id.toString() !== friendId);
      await req.user.save();
      res.send('Friend request rejected');
    } catch (error) {
      res.status(500).send(error);
    }
  });

app.get('/friend-recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);
    const recommendations = await User.find({
      _id: { $nin: [...friendIds, req.user._id] },
      friends: { $in: friendIds }
    }).limit(5);
    res.send(recommendations);
  } catch (error) {
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));