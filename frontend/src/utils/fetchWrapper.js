export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken') || 'uakBngoqs7NrqSR1FnFrwF7JOamYAfQv---cQqpY2OA'; // Use fallback token if not found
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`, // Attach token
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}
