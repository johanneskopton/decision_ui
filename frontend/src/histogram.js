import Chart from "chart.js";

import niceScale from "./helper/nice_scale";

const colors = ["rgba(206, 147, 216, 0.7)", "rgba(77, 182, 172, 0.7)"];

export default function(graph, ctx, bins, density, in_node = false) {
  if (in_node) {
    var baseColor = "rgba(255, 255, 255, 1)";
    var baseColor2 = "rgba(255, 255, 255, 0.2)";
    var max_ticks = 7;
    datasets = [
      {
        data: density,
        categoryPercentage: 1.0,
        barPercentage: 1.1,
        backgroundColor: "rgba(206, 147, 216, 1)" // TODO: make dynamic (vuetify)
      }
    ];
  } else {
    const baseColor = "rgba(155, 155, 155, 1)";
    const baseColor2 = "rgba(155, 155, 155, 0.2)";
    var max_ticks = 15;
    var datasets = [];
    const n_variables = Object.keys(density).length;
    var i = 0;
    for (const variable in density) {
      datasets.push({
        data: density[variable],
        categoryPercentage: 1.0,
        barPercentage: n_variables + 0.1,
        backgroundColor: colors[i]
      });
      i++;
    }
    /* [
          Object.keys(this.histData.density)[0]
        ];*/
  }

  // Calculate X-ticks
  var scale = niceScale(bins[0], bins[bins.length - 1], max_ticks);
  var target_tick_values = [];
  for (let i = 0; i < max_ticks; i++) {
    target_tick_values[i] = scale.niceMinimum + scale.tickSpacing * i;
  }
  var tick_index = 1;
  var x_ticks = {
    maxRotation: 90,
    minRotation: 0,
    autoSkip: false,
    maxTicksLimit: max_ticks,
    fontColor: baseColor,
    callback: function(value, _, values) {
      //var tickDistance = values[1] - values[0];
      //var tickDistance = scale.tickSpacing;
      //var numDecimal = -1 * Math.floor(Math.log10(tickDistance));
      //numDecimal = Math.max(numDecimal, 0);
      //return value.toFixed(numDecimal);
      let target_tick_value = target_tick_values[tick_index];
      if (value > target_tick_value) {
        tick_index++;
        let target_tick_value_rounded = +target_tick_value.toFixed(5);
        return target_tick_value_rounded;
      }
    }
  };

  if (graph) graph.destroy();
  return Chart.Bar(ctx, {
    data: {
      labels: bins,
      datasets: datasets
    },
    options: {
      scales: {
        xAxes: [
          {
            ticks: x_ticks,
            gridLines: {
              color: baseColor2,
              zeroLineColor: baseColor
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              fontColor: baseColor,
              maxTicksLimit: 4
            },
            gridLines: {
              color: baseColor2,
              zeroLineColor: baseColor
            }
          }
        ]
      },
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      },
      aspectRatio: 1.41,
      hover: { mode: null },
      options: {
        events: []
      }
    }
  });
}
