import axios from 'axios';

export const fetchSystemsByUserId = (userId) => {
    return axios.get(`http://localhost:8081/fetch-systems?userId=${userId}`);
};


export const getTableColumnsByUserId = () => {
    return axios.get(`http://localhost:8081/get-column-names`);
};
