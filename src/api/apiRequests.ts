import authApiClient, { apiClient } from './apiClient';

export function login(username: string, pass: string) {
  return apiClient.post('/login/', {
    "identifier": username,
    "password": pass
  });
};

export function signup(username: string, email: string, pass: string) {
  return apiClient.post('/signup/', {
    "username": username,
    "email": email,
    "password": pass
  });
};

export function generateTimetable(data: string) {
  return authApiClient.post('/generate-time-table', data);
};

export function fetchTimetable(id: string) {
  return authApiClient.post('/fetch-time-table', {
    "user_id": localStorage.getItem('token'),
    id
  });
};