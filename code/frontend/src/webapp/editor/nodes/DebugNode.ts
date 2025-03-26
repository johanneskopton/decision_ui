import { defineNode, NodeInterface, TextareaInputInterface, TextInterface } from "baklavajs";
import { isDeterministic } from "../common/nodes";
import nj from "@d4c/numjs";

export const DebugNode = defineNode({
  type: "Debug",

  title: "Debug",

  inputs: {
    input: () => new NodeInterface<any>("Input", null)
  },

  outputs: {
    type: () => new TextInterface("Type", "").setPort(false),
    shape: () => new TextInterface("Shape", "").setPort(false),
    raw: () => new TextareaInputInterface("", "").setPort(false)
  },

  calculate({ input }) {
    if (input == null) {
      return { raw: "null", type: "", shape: "" };
    }
    if (isDeterministic(input)) {
      return { raw: JSON.stringify(input), type: typeof input, shape: "" };
    }
    const a = nj.array(input);
    return { raw: JSON.stringify(input), type: "array", shape: "Shape: " + JSON.stringify(a.shape) };
  },

  onPlaced() {
    this.width = 300;
  }
});
