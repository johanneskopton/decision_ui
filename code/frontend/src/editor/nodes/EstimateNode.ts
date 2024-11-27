import { defineDynamicNode, DynamicNode, Node, SelectInterface } from "baklavajs";

import {
  AVAILABLE_DISTRIBUTIONS,
  DISRTIBUTIONS,
  NORMAL_DISTRIBUTION,
  type AvailableDistributionsType
} from "../distributions";

import { useModelStore, type EstimatesTableRow } from "@/state/model";

const createEstimatesTableEntry = (title: string, distribution: string, params: any): EstimatesTableRow => {
  return {
    label: title,
    variable: title,
    distribution,
    lower: distribution === "deterministic" ? params.value : params.lower,
    upper: distribution === "deterministic" ? params.value : params.upper
  } as EstimatesTableRow;
};

const updateEstimatesTable = (title: string | undefined, distribution: string, params: any) => {
  if (title) {
    const modelStore = useModelStore();
    // remove existing table row
    modelStore.estimates = modelStore.estimates.filter((value: any) => {
      return value["variable"] != title;
    }, this);
    // re-add table row with current data
    modelStore.estimates.push(createEstimatesTableEntry(title, distribution, params));
  }
};

export const EstimateNode = defineDynamicNode({
  type: "Estimate",

  title: "Estimate",

  inputs: {
    distribution: () =>
      new SelectInterface<AvailableDistributionsType>(
        "Distribution",
        NORMAL_DISTRIBUTION,
        AVAILABLE_DISTRIBUTIONS
      ).setPort(false)
  },

  outputs: {},

  onCreate() {
    const node = this as any as DynamicNode<any, any>;
    node.events.titleChanged.subscribe(node, () => {
      const inputsForNode: Record<string, any> = {};
      Object.entries(node.inputs).forEach(([k, v]) => {
        inputsForNode[k] = v.value;
      });
      const { distribution, ...params } = inputsForNode;
      updateEstimatesTable(this.title, distribution, params);
    });
  },

  onUpdate({ distribution }) {
    return {
      inputs: DISRTIBUTIONS[distribution].inputs,
      outputs: DISRTIBUTIONS[distribution].outputs
    };
  },

  calculate({ distribution, ...params }, context) {
    updateEstimatesTable(this.title, distribution, params);
    return DISRTIBUTIONS[distribution].generate_output(params, context);
  }
});
