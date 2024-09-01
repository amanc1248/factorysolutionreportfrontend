import axios from 'axios';
export const login = async (email, password,) => {
    try {
        const response = await axios.post('http://localhost:8081/login', {
            email, password,
        });
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}