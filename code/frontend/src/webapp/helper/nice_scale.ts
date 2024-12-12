/* Thanks to Glenn Gordon for the implementation. */

let minPoint: number;
let maxPoint: number;
let maxTicks: number;
let tickSpacing: number;
let range: number;
let niceMin: number;
let niceMax: number;

export default function niceScale(min: number, max: number, max_ticks: number) {
  minPoint = min;
  maxPoint = max;
  maxTicks = max_ticks;
  calculate();
  return {
    tickSpacing: tickSpacing,
    niceMinimum: niceMin,
    niceMaximum: niceMax
  };
}

/**
 * Calculate and update values for tick spacing and nice
 * minimum and maximum data points on the axis.
 */
function calculate() {
  range = niceNum(maxPoint - minPoint, false);
  tickSpacing = niceNum(range / (maxTicks - 1), true);
  niceMin = Math.floor(minPoint / tickSpacing) * tickSpacing;
  niceMax = Math.ceil(maxPoint / tickSpacing) * tickSpacing;
}

/**
 * Returns a "nice" number approximately equal to range Rounds
 * the number if round = true Takes the ceiling if round = false.
 *
 *  localRange the data range
 *  round whether to round the result
 *  a "nice" number to be used for the data range
 */
function niceNum(localRange: number, round: boolean) {
  const exponent = Math.floor(Math.log10(localRange)); /** exponent of localRange */
  const fraction = localRange / Math.pow(10, exponent); /** fractional part of localRange */
  let niceFraction: number; /** nice, rounded fraction */

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return niceFraction * Math.pow(10, exponent);
}

/**
 * Sets the minimum and maximum data points for the axis.
 *
 *  minPoint the minimum data point on the axis
 *  maxPoint the maximum data point on the axis
 */
export function setMinMaxPoints(localMinPoint: number, localMaxPoint: number) {
  minPoint = localMinPoint;
  maxPoint = localMaxPoint;
  calculate();
}

/**
 * Sets maximum number of tick marks we're comfortable with
 *
 *  maxTicks the maximum number of tick marks for the axis
 */
export function setMaxTicks(localMaxTicks: number) {
  maxTicks = localMaxTicks;
  calculate();
}
