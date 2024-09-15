import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://tutedude-backend-frontend-1.onrender.com',
});

export default instance;