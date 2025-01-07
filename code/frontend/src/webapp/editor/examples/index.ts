import type { IEditorState } from "baklavajs";
import { getTrivialModel } from "./trivial";

export type ExampleModel = {
  name: string;
  description: string;
  stateGenerator: () => IEditorState;
};

export const getExampleModels = (): ExampleModel[] => {
  return [
    {
      name: "Trivial Model",
      description: "A simple model consisting only of a single estimate and result node",
      stateGenerator: getTrivialModel
    }
  ];
};
