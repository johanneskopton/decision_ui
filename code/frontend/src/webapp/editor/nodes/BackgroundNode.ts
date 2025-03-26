import { defineNode } from "baklavajs";

export const BackgroundNode = defineNode({
  type: "Background",

  title: "Background",

  inputs: {},

  outputs: {},

  onPlaced() {
    this.width = 500;
  }
});
