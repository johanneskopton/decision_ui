import axios, { AxiosError, type AxiosResponse } from "axios";

export interface ModelData {
  id: string;
  name: string;
  content: string;
  saved: string;
  owner_id: string;
}

export const doQueryModels = ({
  token,
  onSuccess,
  onError
}: {
  token: string;
  onSuccess: (models: ModelData[]) => void;
  onError: () => void;
}) => {
  axios
    .get(import.meta.env.VITE_BACKEND_BASE_URL + "/api/v1/decision_models/", {
      headers: {
        [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
      }
    })
    .then((response: AxiosResponse) => {
      return onSuccess(response.data as ModelData[]);
    })
    .catch((response: AxiosError) => {
      console.error(`Error retrieving models: ${JSON.stringify(response, null, 2)}`);
      return onError();
    });
};

export const doDeleteModel = ({
  token,
  modelId,
  onSuccess,
  onError
}: {
  token: string;
  modelId: string;
  onSuccess: () => void;
  onError: () => void;
}) => {
  axios
    .delete("/api/v1/decision_models/" + modelId, {
      headers: {
        [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
      }
    })
    .then(() => {
      return onSuccess();
    })
    .catch((response: AxiosError) => {
      console.error(`Error deleting model: ${JSON.stringify(response, null, 2)}`);
      return onError();
    });
};
