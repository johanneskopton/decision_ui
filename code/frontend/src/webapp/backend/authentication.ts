import axios, { AxiosError, type AxiosResponse } from "axios";
import { AUTHORIZATION_HEADER, getBackendBaseURL, REQUEST_TIMEOUT } from "./common";

export const doLoginRequest = async ({
  email,
  password,
  onSuccess,
  onWrongCredentials
}: {
  email: string;
  password: string;
  onSuccess: (token: string) => void;
  onWrongCredentials: () => void;
}) => {
  const formData = new FormData();
  formData.set("username", email);
  formData.set("password", password);
  axios
    .post((await getBackendBaseURL()) + "/api/auth/jwt/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      timeout: REQUEST_TIMEOUT
    })
    .then((response: AxiosResponse) => {
      if (response.status === 200) {
        return onSuccess(response.data.access_token);
      }
    })
    .catch((error: AxiosError) => {
      if (error.code === "ERR_BAD_REQUEST" && (error.response?.data as any).detail === "LOGIN_BAD_CREDENTIALS") {
        return onWrongCredentials();
      }
    });
};

export const doRefreshRequest = async ({
  token,
  onSuccess,
  onWrongCredentials
}: {
  token: string;
  onSuccess: (token: string) => void;
  onWrongCredentials: () => void;
}) => {
  axios
    .post((await getBackendBaseURL()) + "/api/auth/jwt/refresh", null, {
      headers: {
        [AUTHORIZATION_HEADER]: `Bearer ${token}`
      }
    })
    .then((response: AxiosResponse) => {
      if (response.status === 200) {
        return onSuccess(response.data.access_token);
      }
    })
    .catch((error: AxiosError) => {
      if (error.code === "ERR_BAD_REQUEST" && (error.response?.data as any).detail === "LOGIN_BAD_CREDENTIALS") {
        return onWrongCredentials();
      }
    });
};
