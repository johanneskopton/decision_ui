/* Thanks to Glenn Gordon for the implementation. */

var minPoint;
var maxPoint;
var maxTicks;
var tickSpacing;
var range;
var niceMin;
var niceMax;

export default function niceScale(min, max, max_ticks) {
  console.log(min, max, max_ticks);
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
function niceNum(localRange, round) {
  var exponent; /** exponent of localRange */
  var fraction; /** fractional part of localRange */
  var niceFraction; /** nice, rounded fraction */

  exponent = Math.floor(Math.log10(localRange));
  fraction = localRange / Math.pow(10, exponent);

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
function setMinMaxPoints(localMinPoint, localMaxPoint) {
  minPoint = localMinPoint;
  maxPoint = localMaxoint;
  calculate();
}

/**
 * Sets maximum number of tick marks we're comfortable with
 *
 *  maxTicks the maximum number of tick marks for the axis
 */
function setMaxTicks(localMaxTicks) {
  maxTicks = localMaxTicks;
  calculate();
}
