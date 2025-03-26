import type { Node } from "baklavajs";
import type { ValidationFeedback } from "./validate";

export interface ModelCalculationContext {
  mcRuns: number;
  registerValidationError: (node: Node<any, any>, error: ValidationFeedback) => void;
}
