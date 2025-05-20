import { apiClient } from './apiClient';

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
  const formData = new URLSearchParams();
  formData.append("user_id", localStorage.getItem("token") as string);
  formData.append("text", data);

  return apiClient.post('/generate-time-table', formData);
};

export function health() {
  return apiClient.get('/health');
}

export function deletTimetable(id: any) {
  const formData = new URLSearchParams();
  formData.append("text", id);
  return apiClient.post('/delete-time-table/', formData);
};

export function chatBot(msg: any) {
  const formData = new URLSearchParams();
  formData.append("text", msg);
  return apiClient.post('/study-buddy-chatbot/', formData);
};

export function fetchTimetable(id: any) {
  const formData = new URLSearchParams();
  formData.append("text", id);
  return apiClient.post('/fetch-time-table/', formData);
};

export function getAllTimetables() {
  return apiClient.post('/get-all-time-table/');
};