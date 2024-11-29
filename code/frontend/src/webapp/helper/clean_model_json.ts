import type { IEditorState } from "baklavajs";

export default function(state: IEditorState) {

  for (const node of state.graph.nodes) {
    for (const intf of Object.values(node.outputs)) {
      // @ts-expect-error necessary do reduce json file size
      intf.value = null;
    }
  }

  return state;
}
