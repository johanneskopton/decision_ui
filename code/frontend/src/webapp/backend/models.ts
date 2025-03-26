import axios, { AxiosError, type AxiosResponse } from "axios";
import { AUTHORIZATION_HEADER, getBackendBaseURL } from "./common";
import type { DecisionSupportResult, EVPIResult } from "../state/model";

export interface ModelData {
  id: string;
  name: string;
  content: string;
  saved: string;
  owner_id: string;
}

export interface ExecutionError {
  reason: string;
  r_script: string;
  estimates: string;
  stderr: string;
}

export const doQueryModels = async ({
  token,
  onSuccess,
  onError
}: {
  token: string;
  onSuccess: (models: ModelData[]) => void;
  onError: () => void;
}) => {
  axios
    .get((await getBackendBaseURL()) + "/api/v1/decision_models/", {
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

export const doDeleteModel = async ({
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
    .delete((await getBackendBaseURL()) + "/api/v1/decision_models/" + modelId, {
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
  mcRuns,
  bins,
  timeout,
  getEvpi,
  onSuccess,
  onExecutionError,
  onUnknownError
}: {
  token: string;
  model: any;
  mcRuns: number;
  bins: number;
  timeout: number;
  getEvpi: boolean;
  onSuccess: (results: DecisionSupportResult | EVPIResult) => void;
  onExecutionError: (error: ExecutionError) => void;
  onUnknownError: () => void;
}) => {
  const route = getEvpi ? "/api/v1/evpi" : "/api/v1/monte_carlo";
  const options = `?mc_runs=${mcRuns}&timeout=${timeout}` + (getEvpi ? `` : `&bins=${bins}`);
  axios
    .post((await getBackendBaseURL()) + route + options, model, {
      headers: {
        [AUTHORIZATION_HEADER]: `Bearer ${token}`
      }
    })
    .then((response: AxiosResponse) => {
      if (getEvpi) {
        onSuccess(response.data as EVPIResult);
      } else {
        onSuccess(response.data as DecisionSupportResult);
      }
    })
    .catch((error: AxiosError) => {
      if (error.response?.status === 422) {
        // unprocessable content
        onUnknownError();
      } else if (error.response?.status === 500) {
        onExecutionError(error.response?.data as ExecutionError);
      } else {
        // unknown error
        onUnknownError();
      }
    });
};
