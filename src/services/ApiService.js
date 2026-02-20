// src/services/ApiService.js

const API_BASE_URL = 'https://backend-apostolicchain.onrender.com/api';

export const ApiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Se a resposta for OK (200-299), lê o JSON uma única vez e retorna
    if (response.ok) {
      return await response.json();
    }

    // Se deu erro (403, 404, 500...), capturamos a mensagem de erro
    let errorMessage = `Erro ${response.status}`;
    try {
      // Tentamos ler o erro apenas UMA vez
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Se não for um JSON de erro, não fazemos nada, usamos o texto padrão
    }

    throw new Error(errorMessage);
  }

};
