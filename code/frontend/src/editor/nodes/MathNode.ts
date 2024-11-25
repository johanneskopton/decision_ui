import { displayInSidebar, NodeInterface, SelectInterface } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import { probabilisticType } from "../types";
import { BaseNode } from "./BaseNode";

type SupportedOperationType = "Add" | "Subtract" | "Multiply" | "Divide";
const SUPPORTED_OPERATIONS = ["Add", "Subtract", "Multiply", "Divide"] as SupportedOperationType[];

interface ProbabilisticMathInputs {
  A: number[];
  B: number[];
  operation: SupportedOperationType;
}

interface ProbabilisticMathOutputs {
  sample: number[];
}

const MC_RUNS = 1000

export class ProbabilisticMathNode extends BaseNode<ProbabilisticMathInputs, ProbabilisticMathOutputs> {

  public type = "Probabilistic Math";

  public get title() {
    return this.type;
  };

  public inputs = {
    A: (new NodeInterface<number[]>("A", [0.0])).use(setType, probabilisticType),
    B: (new NodeInterface<number[]>("B", [0.0])).use(setType, probabilisticType),
    operation: new SelectInterface<SupportedOperationType>("Operation", "Add", SUPPORTED_OPERATIONS).setPort(false),
  }

  public outputs = {
    sample: new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType),
  }

  private operations = {
    Add: (A: number, B: number) => A + B,
    Subtract: (A: number, B: number) => A - B,
    Multiply: (A: number, B: number) => A * B,
    Divide: (A: number, B: number) => A / B
  };

  public constructor() {
    super();
    this.initializeIo();
  }

  protected _calculate({A, B, operation}: ProbabilisticMathInputs): ProbabilisticMathOutputs {
    const sample = [];
    for (let i = 0; i < MC_RUNS; i++) {
      sample.push(this.operations[operation](A[i], B[i]));
    }
    return { sample };
  }

}
