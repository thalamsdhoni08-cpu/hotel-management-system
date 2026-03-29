/**
 * Boilerplate API.js
 * Handles backend communication.
 */

const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    async fetchRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`);
            if (!response.ok) throw new Error('Failed to fetch rooms');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async bookRoom(bookingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to complete booking');
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

window.api = api;
