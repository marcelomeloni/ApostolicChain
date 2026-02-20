// src/services/LoginService.js
import { ApiService } from './ApiService';

export const LoginService = {
  async login(email, password) {
    const response = await ApiService.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return response;
  }
};