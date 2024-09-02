import axios from 'axios';
import { ip } from '../constants/ipconstants';
export const generateReport = async (startDate, endDate, interval, system, userId) => {
    try {
        const response = await axios.post(`${ip}/get-report`, {
            startDate,
            endDate,
            interval,
            systemId:system,
            userId,
        });
        return response;
    } catch (error) {
        console.error(error)
    }
}