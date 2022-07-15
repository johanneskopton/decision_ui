import Chart from "chart.js";

const colors = ["rgba(206, 147, 216, 0.7)", "rgba(77, 182, 172, 0.7)"];

export default function(graph, ctx, bins, density, in_node = false) {
  if (in_node) {
    var baseColor = "rgba(255, 255, 255, 1)";
    var baseColor2 = "rgba(255, 255, 255, 0.2)";
    var x_ticks = {
      maxRotation: 90,
      minRotation: 0,
      autoSkip: true,
      maxTicksLimit: 7,
      fontColor: baseColor,
      callback: function(value, _, values) {
        var tickDistance = values[1] - values[0];
        var numDecimal = -1 * Math.floor(Math.log10(tickDistance));
        numDecimal = Math.max(numDecimal, 0);
        return value.toFixed(numDecimal);
      }
    };
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
    var x_ticks = {
      maxRotation: 90,
      minRotation: 0,
      autoSkip: true,
      maxTicksLimit: 15,
      fontColor: baseColor,
      callback: function(value, _, values) {
        var tickDistance = values[1] - values[0];
        var numDecimal = -1 * Math.floor(Math.log10(tickDistance));
        numDecimal = Math.max(numDecimal, 0);
        return value.toFixed(numDecimal);
      }
    };
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
