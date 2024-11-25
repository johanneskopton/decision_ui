import { NodeInterface, SelectInterface } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import { probabilisticType } from "../types";
import { BaseNode } from "./BaseNode";

type SupportedOperationType = "add" | "subtract" | "multiply" | "divide";
const SUPPORTED_OPERATIONS = ["add", "subtract", "multiply", "divide"] as SupportedOperationType[];

interface ProbabilisticMathInputs {
  a: number[];
  b: number[];
  operation: SupportedOperationType;
}

interface ProbabilisticMathOutputs {
  sample: number[];
}

const MC_RUNS = 1000;

export class ProbabilisticMathNode extends BaseNode<ProbabilisticMathInputs, ProbabilisticMathOutputs> {
  public type = "Math";

  public get title() {
    return this.type;
  }

  public inputs = {
    a: new NodeInterface<number[]>("A", [0.0]).use(setType, probabilisticType),
    b: new NodeInterface<number[]>("B", [0.0]).use(setType, probabilisticType),
    operation: new SelectInterface<SupportedOperationType>("Operation", "add", SUPPORTED_OPERATIONS).setPort(false)
  };

  public outputs = {
    sample: new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType)
  };

  private operations = {
    add: (a: number, b: number) => a + b,
    subtract: (a: number, b: number) => a - b,
    multiply: (a: number, b: number) => a * b,
    divide: (a: number, b: number) => a / b
  };

  public constructor() {
    super();
    this.initializeIo();
  }

  protected _calculate({ A, B, operation }: ProbabilisticMathInputs): ProbabilisticMathOutputs {
    const sample = [];
    for (let i = 0; i < MC_RUNS; i++) {
      sample.push(this.operations[operation](A[i], B[i]));
    }
    return { sample };
  }
}
