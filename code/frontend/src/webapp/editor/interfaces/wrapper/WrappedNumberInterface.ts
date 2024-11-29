import { NodeInterface } from "baklavajs";
import { markRaw, type ComponentOptions } from "vue";

import WrappedNumberInterfaceComponent from "./WrappedNumberInterfaceComponent.vue";
import { repeat } from "../../../common/array";

export class WrappedNumberInterface extends NodeInterface<number[]> {
  private defaultValue: number;

  constructor(name: string, defaultValue: number) {
    super(name, repeat(defaultValue, 1000));
    this.defaultValue = defaultValue;
  }

  public getDefault() {
    return this.defaultValue;
  }

  component = markRaw(WrappedNumberInterfaceComponent) as ComponentOptions;
}
