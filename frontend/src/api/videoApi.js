import { fetchWithAuth } from '../utils/fetchWrapper';

export async function getVideoList() {
    try {
        const response = await fetchWithAuth('/api/videos/list/');
        return response;
    } catch (error) {
        console.error('Error fetching video list:', error);
        throw error;
    }
}
