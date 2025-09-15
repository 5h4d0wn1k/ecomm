/**
 * Get CSRF token from cookies
 * @returns {string|null} The CSRF token or null if not found
 */
export function getCSRFToken() {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Add CSRF token to axios request config
 * @param {Object} config - Axios request config
 * @returns {Object} Modified config with CSRF token
 */
export function addCSRFTokenToConfig(config) {
  const token = getCSRFToken();
  if (token && config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
    config.headers = config.headers || {};
    config.headers['x-csrf-token'] = token;
  }
  return config;
}