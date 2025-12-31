export const API_BASE_URL = 'http://localhost:5200/api';

export const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized (maybe redirect to login or clear token)
            console.warn('Unauthorized access. Clearing token.');
            // Optional: localStorage.removeItem('token');
        }
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    try {
        return await response.json();
    } catch (err) {
        // If response is not JSON
        return {} as T;
    }
};
