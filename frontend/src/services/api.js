// frontend/src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:8000';

export const decodeSutra = async (text) => {
    try {
        const response = await fetch(`${API_BASE_URL}/decode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Failed to decode sutra.");
        }
        return data;
    } catch (error) {
        throw new Error(error.message || "Failed to connect to the backend server.");
    }
};

export const computeAlgorithm = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/compute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Computation failed.");
        }
        return data;
    } catch (error) {
        throw new Error(error.message || "Failed to connect to the backend server.");
    }
};