import type { IEditorState } from "baklavajs";
import { getTrivialModel } from "./trivial";
import { getMultipleOutputsModel } from "./outputs";
import { getNpvModel } from "./npv";

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
    },
    {
      name: "Multiple Results",
      description: "An artificial example model of three estimate nodes and two result nodes",
      stateGenerator: getMultipleOutputsModel
    },
    {
      name: "Net Present Value",
      description: "A model calculating the net present value of a single cost estimate",
      stateGenerator: getNpvModel
    }
  ];
};
