import axios, { AxiosError, type AxiosResponse } from "axios";
import { AUTHORIZATION_HEADER, BACKEND_BASE_URL } from "./common";
import type { DecisionSupportResult } from "@/state/model";

export interface ModelData {
  id: string;
  name: string;
  content: string;
  saved: string;
  owner_id: string;
}

interface ExecutionError {
  r_script: string;
  estimates: string;
  stdout: string;
  stderr: string;
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
    .get(BACKEND_BASE_URL + "/api/v1/decision_models/", {
      headers: {
        [AUTHORIZATION_HEADER]: `Bearer ${token}`
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
    .delete(BACKEND_BASE_URL + "/api/v1/decision_models/" + modelId, {
      headers: {
        [AUTHORIZATION_HEADER]: `Bearer ${token}`
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

export const doRunModel = async ({
  token,
  model,
  getEvpi,
  onSuccess,
  onNetworkError,
  onExecutionError,
  onUnknownError
}: {
  token: string;
  model: any;
  getEvpi: boolean;
  onSuccess: (results: DecisionSupportResult) => void;
  onNetworkError: () => void;
  onExecutionError: (msg: string) => void;
  onUnknownError: () => void;
}) => {
  const route = getEvpi ? "/api/v1/evpi" : "/api/v1/monte_carlo";
  axios
    .post(BACKEND_BASE_URL + route, model, {
      headers: {
        [AUTHORIZATION_HEADER]: `Bearer ${token}`
      }
    })
    .then((response: AxiosResponse) => onSuccess(response.data as DecisionSupportResult))
    .catch((error: AxiosError) => {
      if (error.code === "ERR_NETWORK") {
        onNetworkError();
      } else if (error.response?.status == 401) {
        // should be picked up by interceptor
      } else if (error.response?.status === 422) {
        // unprocessable content
        onUnknownError();
      } else if (error.response?.status === 500) {
        const executionError = error.response?.data as ExecutionError;
        onExecutionError(executionError.stderr);
      } else {
        // unknown error
        onUnknownError();
      }
    });
};
