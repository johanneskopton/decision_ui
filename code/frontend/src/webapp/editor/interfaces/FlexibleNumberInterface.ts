import { NodeInterface, NumberInterfaceComponent } from "baklavajs";
import { markRaw, type ComponentOptions } from "vue";

export class FlexibleNumberInterface extends NodeInterface<number | number[] | number[][]> {
  constructor(name: string, value: number) {
    super(name, value);
  }

  component = markRaw(NumberInterfaceComponent) as ComponentOptions;
}
