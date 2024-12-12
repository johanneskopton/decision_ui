import type { Node } from "baklavajs";
import type { NodeValidationError } from "./validation";

export interface ModelCalculationContext {
  mcRuns: number;
  registerValidationError: (node: Node<any, any>, error: NodeValidationError) => void;
}
