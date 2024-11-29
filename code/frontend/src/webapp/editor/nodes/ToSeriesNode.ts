import nj from "@d4c/numjs";
import { defineDynamicNode, IntegerInterface, NodeInterface, SelectInterface, setType } from "baklavajs";
import { deterministicIntegerType, probabilisticSeriesType, probabilisticType } from "../common/types";
import { DeterministicNumberInterface } from "../interfaces/DeterministicNumberInterface";
import { repeat } from "../../common/array";
import { makeArray } from "../common/math";

type AvailableTimestepsType = "every" | "as defined";

const TIMESTEP_EVERY = "every";
const TIMESTEP_AS_DEFINED = "as defined";
const AVAILABLE_TIMESTEPS = [TIMESTEP_EVERY, TIMESTEP_AS_DEFINED];

export const ToSeriesNode = defineDynamicNode({
  type: "ToSeries",

  title: "To Series",

  inputs: {
    timestep_method: () =>
      new SelectInterface<AvailableTimestepsType>("Timestep Method", TIMESTEP_EVERY, AVAILABLE_TIMESTEPS).setPort(
        false
      ),
    x: () => new DeterministicNumberInterface("X", 0.0).use(setType, probabilisticType),
    n: () => new IntegerInterface("N", 10, 1).use(setType, deterministicIntegerType)
  },

  outputs: {
    series: () => new NodeInterface<number[][]>("Series", [[]]).use(setType, probabilisticSeriesType)
  },

  onUpdate(inputValues) {
    if (inputValues.timestep_method === TIMESTEP_AS_DEFINED) {
      return {
        inputs: {
          timestep: () => new IntegerInterface("Timestep", 0, 0).use(setType, deterministicIntegerType)
        }
      };
    }
    return {};
  },

  calculate({ timestep_method, x, n, ...rest }, { globalValues }) {
    const mcRuns = globalValues.mcRuns;
    x = makeArray(x, mcRuns);
    let series = null;
    if (timestep_method == TIMESTEP_AS_DEFINED) {
      series = nj.zeros([mcRuns, n]);
      const x_ = nj.array(x).reshape(mcRuns, 1);
      series.slice([0, mcRuns], [rest.timestep, rest.timestep + 1]).assign(x_, false);
    } else {
      series = nj.stack(repeat(x, n)).T;
    }
    return {
      series: series.tolist() as number[][]
    };
  }
});
