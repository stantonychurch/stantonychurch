import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Attach retry logic for cold-start timeouts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      (error.code === 'ECONNABORTED' || !error.response) &&
      (!config.__retryCount || config.__retryCount < 2)
    ) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      console.log(`Connection failed/timeout. Retrying request (${config.__retryCount}/2)...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return apiClient(config);
    }
    return Promise.reject(error);
  }
);

// Auth
export const memberLogin = (data) => apiClient.post('/auth/member/login', data);
export const memberRegister = (data) => apiClient.post('/auth/member/register', data);
export const adminLogin = (data) => apiClient.post('/auth/admin/login', data);

// Content
export const getVideos = () => apiClient.get('/videos');
export const getAudio = () => apiClient.get('/audio');
export const getEvents = () => apiClient.get('/events');
export const getVerses = () => apiClient.get('/verses');
export const getVerseOfDay = () => apiClient.get('/platform/verse-of-day');
export const postVerse = (data) => apiClient.post('/verses', data);
export const deleteVerse = (id) => apiClient.delete(`/verses/${id}`);
export const getDevotionals = () => apiClient.get('/devotionals');
export const getPrayer = () => apiClient.get('/prayer');
export const submitPrayer = (data) => apiClient.post('/prayer', data);
export const getAnnouncements = () => apiClient.get('/announcements');
export const getJournal = () => apiClient.get('/journal');
export const saveJournal = (data) => apiClient.post('/journal', data);
export const getWorship = () => apiClient.get('/worship');
export const getQuiz = () => apiClient.get('/quiz');
export const getArticles = () => apiClient.get('/articles');
export const getStreaks = () => apiClient.get('/streaks');
export const getHistory = () => apiClient.get('/history');
export const getMembers = () => apiClient.get('/members');

// Platform / Extended
export const getPlatform = (path) => apiClient.get('/platform' + path);
export const postPlatform = (path, data) => apiClient.post('/platform' + path, data);

export default apiClient;
