import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { logout } from '../slices/authSlice';

function Home() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [token]);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, [token]);

  const fetchFriendRequests = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/friend-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriendRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  }, [token]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/friend-recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchUsers();
      fetchFriends();
      fetchFriendRequests();
      fetchRecommendations();
    }
  }, [token, navigate, fetchUsers, fetchFriends, fetchFriendRequests, fetchRecommendations]);

  const sendFriendRequest = async (friendId) => {
    try {
      await axios.post('/api/users/friend-request', { friendId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (friendId) => {
    try {
      await axios.post('/api/users/accept-friend', { friendId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (friendId) => {
    try {
      await axios.post('/api/users/reject-friend', { friendId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Search Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <ul className="mt-4 space-y-2">
          {filteredUsers.map(user => (
            <li key={user._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
              {user.username}
              <button
                onClick={() => sendFriendRequest(user._id)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Friend Requests</h2>
        <ul className="space-y-2">
          {friendRequests.map(request => (
            <li key={request._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
              {request.username}
              <div>
                <button
                  onClick={() => acceptFriendRequest(request._id)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectFriendRequest(request._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
        <ul className="space-y-2">
          {friends.map(friend => (
            <li key={friend._id} className="bg-white p-4 rounded shadow">
              {friend.username}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Friend Recommendations</h2>
        <ul className="space-y-2">
          {recommendations.map(user => (
            <li key={user._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
              {user.username}
              <button
                onClick={() => sendFriendRequest(user._id)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;