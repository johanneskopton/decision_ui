import axios, { AxiosError, type AxiosResponse } from "axios";

export const doLoginRequest = ({
  email,
  password,
  onSuccess,
  onNetworkError,
  onWrongCredentials
}: {
  email: string;
  password: string;
  onSuccess: (token: string) => void;
  onNetworkError: () => void;
  onWrongCredentials: () => void;
}) => {
  const formData = new FormData();
  formData.set("username", email);
  formData.set("password", password);
  axios
    .post(import.meta.env.VITE_BACKEND_BASE_URL + "/api/auth/jwt/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    .then((response: AxiosResponse) => {
      if (response.status === 200) {
        return onSuccess(response.data.access_token);
      } else {
        return onNetworkError();
      }
    })
    .catch((error: AxiosError) => {
      if (error.code === "ERR_NETWORK") {
        return onNetworkError();
      } else {
        if (error.code === "ERR_BAD_REQUEST" && (error.response?.data as any).detail === "LOGIN_BAD_CREDENTIALS") {
          return onWrongCredentials();
        } else {
          console.error(`Unknown loging error: ${JSON.stringify(error, null, 2)}`);
          return onNetworkError();
        }
      }
    });
};
