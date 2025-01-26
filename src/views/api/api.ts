import axios from "axios";
import api from "@/api/api";
import qs from 'qs'

// Create axios instance with default params
const axiosInstance = axios.create();

const aliatechApi = api(axiosInstance);

// base URL for profiling application
aliatechApi.defaults.paramsSerializer = function (params: any) {
    return qs.stringify(params, { indices: false }); // param=value1&param=value2
}
aliatechApi.defaults.baseURL = import.meta.env.VITE_BASE_URL_ALIATECH
export default aliatechApi;
