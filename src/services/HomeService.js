// src/services/HomeService.js
import { ApiService } from './ApiService';

export const HomeService = {
  async getMainChain() {
    return await ApiService.request('/public/clergy/main-chain', { method: 'GET' });
  },

  async search(name) {
    return await ApiService.request(`/public/clergy/search?name=${encodeURIComponent(name)}`, { method: 'GET' });
  },

  async traceLineage(hash) {
    return await ApiService.request(`/public/clergy/trace/${encodeURIComponent(hash)}`, { method: 'GET' });
  },

  async getNode(hash) {
    return await ApiService.request(`/public/clergy/node/${encodeURIComponent(hash)}`, { method: 'GET' });
  },

  async getPublicStats() {
    return await ApiService.request('/public/stats', { method: 'GET' });
  },
};