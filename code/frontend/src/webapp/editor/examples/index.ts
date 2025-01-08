import type { IEditorState } from "baklavajs";
import { getExampleTrivialModel } from "./1_trivial";
import { getExampleMultipleOutputsModel } from "./2_outputs";
import { getNpvModel } from "./5_npv";
import { getSubgraphModel } from "./6_subgraph";
import { getExampleOperationsModel } from "./3_operations";
import { getExampleErrorModel } from "./4_errors";
import { getExampleSheepVsAppleModel } from "./7_sheep_vs_apple";

export type ExampleModel = {
  name: string;
  description: string;
  stateGenerator: () => IEditorState;
};

export const getExampleModels = (): ExampleModel[] => {
  return [
    {
      name: "1. Minimal Model",
      description: "A model consisting only of a single estimate and result node",
      stateGenerator: getExampleTrivialModel
    },
    {
      name: "2. Multiple Results",
      description: "An artificial example model of three estimate and result nodes",
      stateGenerator: getExampleMultipleOutputsModel
    },
    {
      name: "3. Math Operations",
      description: "A model summing up two estimates",
      stateGenerator: getExampleOperationsModel
    },
    {
      name: "4. A Model with Errors",
      description: "A model that is not valid and produces errors",
      stateGenerator: getExampleErrorModel
    },
    {
      name: "5. Net Present Value",
      description: "A model calculating the net present value of a single cost estimate",
      stateGenerator: getNpvModel
    },
    {
      name: "6. An NPV Subgraph",
      description: "A model containing a reusable subgraph that calculates a 10-year NPV",
      stateGenerator: getSubgraphModel
    },
    {
      name: "7. Decision: Add Apple Agroforestry",
      description: "A model that investigates the benefit of adding an apple agroforestry to a sheep farm",
      stateGenerator: getExampleSheepVsAppleModel
    }
  ];
};
