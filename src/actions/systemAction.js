import axios from 'axios';
import { ip } from '../constants/ipconstants';

export const fetchSystemsByUserId = (userId) => {
    return axios.get(`${ip}/fetch-systems?userId=${userId}`);
};


export const getTableColumnsByUserId = () => {
    return axios.get(`${ip}/get-column-names`);
};
