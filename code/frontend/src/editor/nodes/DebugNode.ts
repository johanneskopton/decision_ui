import { defineNode, NodeInterface, TextareaInputInterface } from "baklavajs";

export const DebugNode = defineNode({
  type: "Debug",

  title: "Debug",

  inputs: {
    input: () => new NodeInterface<any>("Input", null)
  },

  outputs: {
    output: () => new NodeInterface<any>("Output", null),
    display: () => new TextareaInputInterface("", "").setPort(false)
  },

  calculate({ input }) {
    return {
      display: input === null ? "" : JSON.stringify(input, null, 2),
      output: input
    };
  },

  onPlaced() {
    this.width = 300;
  }
});
