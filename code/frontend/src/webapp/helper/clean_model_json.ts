import type { IEditorState, IGraphNodeState, IGraphState, IGraphTemplateState } from "baklavajs";

export default function (state: IEditorState) {
  state.graph = cleanGraph(state.graph);
  state.graphTemplates = state.graphTemplates.map(g => cleanGraph(g));

  return state;
}

export const cleanGraph = <T extends IGraphState | IGraphTemplateState>(graph: T) => {
  for (const node of graph.nodes) {
    for (const intf of Object.values(node.outputs)) {
      // @ts-expect-error necessary do reduce json file size
      intf.value = null;
    }
    if ((node as IGraphNodeState).graphState) {
      (node as IGraphNodeState).graphState = cleanGraph((node as IGraphNodeState).graphState);
    }
  }

  return graph;
};
