import { defineDynamicNode, NodeInterface, SelectInterface } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import {
  AVAILABLE_DISTRIBUTIONS,
  DISRTIBUTIONS,
  NORMAL_DISTRIBUTION,
  type AvailableDistributionsType
} from "../distributions";

import { probabilisticType } from "../types";
import { useModelStore, type EstimatesTableRow } from "@/state/model";

const N_RUNS = 1000;

const createEstimatesTableEntry = (title: string, distribution: string, params: any): EstimatesTableRow => {
  return {
    label: title,
    variable: title,
    distribution,
    lower: params.lower,
    upper: params.upper,
  } as EstimatesTableRow;
}

const updateEstimatesTable = (title: string | undefined, distribution: string, params: any) => {
  if (title) {
    const modelStore = useModelStore();
    // remove existing table row
    modelStore.estimates = modelStore.estimates.filter((value: any) => {
      return value["variable"] != title;
    }, this);
    // re-add table row with current data
    modelStore.estimates.push(
      createEstimatesTableEntry(title, distribution, params)
    );
  }
}

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

  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType)
  },

  onUpdate({ distribution }) {
    return {
      inputs: DISRTIBUTIONS[distribution].inputs
    };
  },

  calculate({ distribution, ...params }) {
    updateEstimatesTable(this.title, distribution, params);

    return {
      sample: DISRTIBUTIONS[distribution].random_sample(params, N_RUNS)
    };
  }
});
