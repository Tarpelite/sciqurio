import axiosInstance from '../utils/axiosConfig';

export async function getUserProfile() {
    try {
        const response = await axiosInstance.get('/api/users/profile/');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}
