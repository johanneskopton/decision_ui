import { NodeInterface, NumberInterfaceComponent } from "baklavajs";
import { markRaw, type ComponentOptions } from "vue";

export class DeterministicNumberInterface extends NodeInterface<number | number[]> {
  constructor(name: string, value: number) {
    super(name, value);
  }

  component = markRaw(NumberInterfaceComponent) as ComponentOptions;
}
