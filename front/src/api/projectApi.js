// src/api/projectApi.js (создайте новый файл)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'

export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Если используете JWT
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};
