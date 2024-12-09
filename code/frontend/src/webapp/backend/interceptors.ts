import axios, { AxiosError, type AxiosResponse } from "axios";

export const registerUnauthorizedInterceptor = (onUnauthorized: () => void) => {
  axios.interceptors.response.use(
    async (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      if (error.code === "ERR_BAD_REQUEST" && error.status == 401) {
        onUnauthorized();
      }
      throw error;
    }
  );
};
