import axios from 'axios';
export const generateReport = async (startDate, endDate, interval, system, userId) => {
    try {
        const response = await axios.post('http://localhost:8081/get-report', {
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