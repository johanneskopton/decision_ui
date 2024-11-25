import { Node, type CalculateFunction, type CalculationContext } from "@baklavajs/core";


export abstract class BaseNode<I, O> extends Node<I, O> {

  protected abstract _calculate(inputs: I, context: CalculationContext): O;

  public calculate: CalculateFunction<I, O> = (inputs, context): O => {
    return this._calculate(inputs, context);
  }

}
