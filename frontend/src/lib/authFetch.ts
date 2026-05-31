/**
 * Authentication fetch wrapper.
 * Retrieves token from localStorage and attaches it to the Authorization header.
 */
export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Intercept and replace localhost with the deployed API URL
  let parsedInput = input;
  if (typeof parsedInput === 'string' && parsedInput.includes('http://localhost:8000')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      parsedInput = parsedInput.replace('http://localhost:8000', baseUrl);
  }

  return fetch(parsedInput, {
    ...init,
    headers,
  });
};
