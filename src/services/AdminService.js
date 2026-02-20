// AdminService.js
import { ApiService } from './ApiService';

export const AdminService = {
  async getPopes({ page = 0, size = 20 } = {}) {
    return ApiService.request(`/clergy/popes?page=${page}&size=${size}`, { method: 'GET' });
  },

  async getBishops({ page = 0, size = 30 } = {}) {
    return ApiService.request(`/clergy/bishops?page=${page}&size=${size}`, { method: 'GET' });
  },

  async initializeGenesis(genesisData) {
    return ApiService.request('/clergy/genesis', { method: 'POST', body: JSON.stringify(genesisData) });
  },

  async createClergy(clergyData) {
    return ApiService.request('/clergy', { method: 'POST', body: JSON.stringify(clergyData) });
  },

  async getStats() {
    return ApiService.request('/clergy/stats', { method: 'GET' });
  },
};