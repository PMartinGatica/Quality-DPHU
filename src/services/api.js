// URL completa de tu Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvVL_MzmX8NGdNOOiCPRYSs-RrG93_EPAPLbZY6MAmxPS3mb-mEqQT0tT2sAcRv5T4/exec';

// Determina si estamos en localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '0.0.0.0';

// Usar siempre la URL completa de Google Scripts
export const API_URL = GOOGLE_SCRIPT_URL;

export const API_CONFIG = {
  timeout: 45000,
  retryAttempts: 3,
  isLocalhost,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Función para logging
export const logApiCall = (url, params) => {
  console.log('🌐 API Call:', {
    environment: isLocalhost ? 'Development' : 'Production',
    url: url,
    params: params,
    timestamp: new Date().toISOString()
  });
};