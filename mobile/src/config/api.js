// ─── API Configuration ───────────────────────────────
// Change this IP to your computer's local IP address
// Run the backend server first: node server.js
// Your IP shows in the terminal when the server starts

export const API_BASE_URL = 'https://stantonychurch-1.onrender.com/api';

export const ENDPOINTS = {
  // Auth
  memberLogin: '/auth/member/login',
  memberRegister: '/auth/member/register',
  adminLogin: '/auth/admin/login',
  // Content
  videos: '/videos',
  audio: '/audio',
  events: '/events',
  verses: '/verses',
  devotionals: '/devotionals',
  prayer: '/prayer',
  announcements: '/announcements',
  journal: '/journal',
  worship: '/worship',
  quiz: '/quiz',
  articles: '/articles',
  streaks: '/streaks',
  history: '/history',
  members: '/members',
  // Platform (extended)
  platform: '/platform',
};
