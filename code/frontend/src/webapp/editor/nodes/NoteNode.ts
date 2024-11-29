import { defineNode, TextareaInputInterface } from "baklavajs";

export const NoteNode = defineNode({
  type: "Note",

  title: "Note",

  inputs: {
    note: () => new TextareaInputInterface("Note", "").setPort(false)
  },

  outputs: {},

  onPlaced() {
    this.width = 300;
  }
});
