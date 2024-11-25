import type { NodeInterface } from "baklavajs";

export interface DistributionConfiguration {
    inputs: { [key: string]: () => NodeInterface };
    random_sample: (params: any, size: number) => number[];
}