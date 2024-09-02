import axios from 'axios';
import { ip } from '../constants/ipconstants';
export const login = async (email, password,) => {
    try {
        const response = await axios.post(`${ip}/login`, {
            email, password,
        });
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}