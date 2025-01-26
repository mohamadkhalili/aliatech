import { useCookies } from '@vueuse/integrations/useCookies'
import type { AxiosRequestConfig, AxiosInstance, AxiosError } from "axios"
import axios from "axios";
import { useApi } from '@/composables/useApi';
import { apiStatus } from './constants/apiStatus';
import { postRefresh } from '@/views/api/apAliatech';

const { IDLE, PENDING } = apiStatus;

const cookies = useCookies()

// const refreshApi = useApi(postRefresh)

export const didAbort = (error: any) => axios.isCancel(error);
export const getCancelSource = () => axios.CancelToken.source();

let statusRefreshRequest = IDLE

// Main api function
const api = (axiosInstance: AxiosInstance) => {

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response && error.response.status === 403) {
        if (statusRefreshRequest === IDLE) {
          const refreshApi = useApi(postRefresh)

          statusRefreshRequest = PENDING
          // Perform redirection to the login page or any other desired page
          const refresh = cookies.get('refresh')
          await refreshApi.exec(refresh)
          cookies.set('access', refreshApi?.data?.value?.data)
          statusRefreshRequest = IDLE

          if (refreshApi?.statusError) {
            window.location.href = "/login?redirect=" + window.location.pathname;
          }

        }
        // Optionally, you can also clear acny stored authentication tokens here
        // localStorage.removeItem("authToken");
      }
      if (error.response && error.response.status === 401) {
        // Perform redirection to the login page or any other desired page

        window.location.href = "/login?redirect=" + window.location.pathname;
        // Optionally, you can also clear acny stored authentication tokens here
        // localStorage.removeItem("authToken");
      }
      return Promise.reject(error);
    }
  );


  // abort function
  const withAbort =
    (fn: any) =>
      async (...args: any) => {
        const originalConfig = args[args.length - 1];
        // Extract abort property from the config
        const { abort, ...config } = originalConfig;

        // Create cancel token and abort method only if abort
        // function was passed
        if (typeof abort === "function") {
          const { cancel, token } = getCancelSource();
          config.cancelToken = token;
          abort(cancel);
        }
        try {
          // Spread all arguments from args besides the original config,
          // and pass the rest of the config without abort property
          return await fn(...args.slice(0, args.length - 1), config);
        } catch (error: any) {
          // Add "aborted" property to the error if the request was cancelled
          didAbort(error) && (error.aborted = true);
          throw error;
        }
      };

  const withLogger = async (promise: any) =>
    promise.catch((error: any) => {
      // eslint-disable-next-line no-undef
      /*
Always log errors in dev environment
if (process.env.NODE_ENV !== 'development') throw error
*/
      // Log error only if DEV env is set to true
      if (!import.meta.env.DEV) throw error;
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error Response Data: ", error.response.data);
        console.log("Error Response Status: ", error.response.status);
        console.log("Error Response Headers: ", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest
        // in the browser and an instance of
        // http.ClientRequest in node.js
        console.log("Request Error", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log("Error Config: ", error.config);

      throw error;
    });

  // Wrapper functions around axios
  return {
    get: (url: string, config: AxiosRequestConfig = {}) =>
      withLogger(withAbort(axiosInstance.get)(url, config)),
    post: (url: string, body: object, config: AxiosRequestConfig = {}) =>
      withLogger(withAbort(axiosInstance.post)(url, body, config)),
    put: (url: string, body: object, config: AxiosRequestConfig = {}) =>
      withLogger(withAbort(axiosInstance.put)(url, body, config)),
    patch: (url: string, body: object, config: AxiosRequestConfig = {}) =>
      withLogger(withAbort(axiosInstance.patch)(url, body, config)),
    delete: (url: string, config: AxiosRequestConfig = {}) =>
      withLogger(withAbort(axiosInstance.delete)(url, config)),
    defaults: axiosInstance.defaults,
  };
};
// Initialise the api function and pass axiosInstance to it
export default api;
