/**
 * Authentication fetch wrapper.
 * Retrieves token from localStorage and attaches it to the Authorization header.
 * Automatically redirects API calls to the correct backend URL in production.
 */
import { API_URL } from "./config";

export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Replace localhost with the deployed API URL
  let parsedInput = input;
  if (typeof parsedInput === 'string' && parsedInput.includes('http://localhost:8000')) {
      parsedInput = parsedInput.replace('http://localhost:8000', API_URL);
  }

  return fetch(parsedInput, {
    ...init,
    headers,
  });
};
