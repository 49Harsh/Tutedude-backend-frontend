const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post('/friend-request', auth, async (req, res) => {
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

router.post('/accept-friend', auth, async (req, res) => {
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

router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username');
    res.send(user.friends);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/friend-requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', 'username');
    res.send(user.friendRequests);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/reject-friend', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    req.user.friendRequests = req.user.friendRequests.filter(id => id.toString() !== friendId);
    await req.user.save();
    res.send('Friend request rejected');
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/friend-recommendations', auth, async (req, res) => {
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

module.exports = router;