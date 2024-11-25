import { NodeInterface, setType, type CalculationContext } from "baklavajs";
import { probabilisticType } from "../types";
import { BaseNode } from "./BaseNode";

const MC_RUNS = 1000;

interface UncertainOutputs {
  sample: number[];
}

interface UncertainInputs {
  [key: string]: number[];
}

export abstract class UncertainNode<I extends UncertainInputs> extends BaseNode<I, UncertainOutputs> {

  public outputs = {
    sample: new NodeInterface("sample", 0).use(setType, probabilisticType),
  }


}
