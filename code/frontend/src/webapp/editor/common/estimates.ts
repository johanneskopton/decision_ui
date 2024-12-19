import type { Graph } from "baklavajs";
import { parse } from "csv-parse";

import { ESTIMATE_NODE_TYPE } from "./types";
import { generateVariableName } from "./variables";
import { DETERMINISTIC_DISTRIBUTION } from "../distributions";
import type { EstimatesTableRow } from "../../state/model";

type EstimatesTableRowKeys = keyof EstimatesTableRow;

interface EstimatesTableCsvRow extends EstimatesTableRow {
  node: string;
}

export const ESTIMATES_CSV_HEADER: (keyof EstimatesTableCsvRow)[] = [
  "label",
  "variable",
  "distribution",
  "lower",
  "upper",
  "comment",
  "node"
];

export const UPDATEDABLE_ESTIMATE_FIELDS: EstimatesTableRowKeys[] = [
  "label",
  "distribution",
  "upper",
  "lower",
  "comment"
];

export const generateEstimatesTableFromGraph = (graph: Graph) => {
  const estimates: { [nodeId: string]: EstimatesTableRow } = {};
  for (const node of graph.nodes) {
    if (node.type == ESTIMATE_NODE_TYPE) {
      const distribution = node.inputs["distribution"].value;
      const is_deterministic = distribution == DETERMINISTIC_DISTRIBUTION;
      const upper = is_deterministic ? node.inputs["value"].value : node.inputs["upper"].value;
      const lower = is_deterministic ? node.inputs["value"].value : node.inputs["lower"].value;
      const comment = node.inputs["comment"].value;

      estimates[node.id] = {
        label: node.title,
        variable: generateVariableName(node.title),
        distribution: is_deterministic ? "const" : distribution,
        upper,
        lower,
        comment
      };
    }
  }

  return estimates;
};

export const convertEstimatesToCSV = (estimates: { [nodeId: string]: EstimatesTableRow }) => {
  const replaceNull = (key: string, value: any) => (value === null ? "" : value);
  const data = Object.keys(estimates).map(node => {
    return {
      ...estimates[node],
      node
    };
  });
  return [
    ESTIMATES_CSV_HEADER.join(","),
    ...data.map(row => ESTIMATES_CSV_HEADER.map(field => JSON.stringify((row as any)[field], replaceNull)).join(","))
  ].join("\r\n");
};

export const parseEstimatesFromCSV = async (csv: string) => {
  return new Promise<{ [nodeId: string]: EstimatesTableRow }>((resolve, reject) => {
    parse(
      csv,
      {
        skip_empty_lines: true,
        columns: ESTIMATES_CSV_HEADER,
        delimiter: ",",
        quote: '"',
        encoding: "utf8"
      },
      (err, records) => {
        if (err) {
          return reject(err);
        }

        const estimates: { [nodeId: string]: EstimatesTableRow } = {};
        for (const row of records) {
          const { node, ...withoutNode } = row;
          estimates[node] = withoutNode;
        }

        return resolve(estimates);
      }
    );
  });
};
