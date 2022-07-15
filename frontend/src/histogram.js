import Chart from "chart.js";

export default function(graph, ctx, bins, bin_counts, in_node = false) {
  if (in_node) {
    var baseColor = "rgba(255, 255, 255, 1)";
    var baseColor2 = "rgba(255, 255, 255, 0.2)";
  } else {
    var baseColor = "rgba(155, 155, 155, 1)";
    var baseColor2 = "rgba(155, 155, 155, 0.2)";
  }

  if (graph) graph.destroy();
  return Chart.Bar(ctx, {
    data: {
      labels: bins,
      datasets: [
        {
          data: bin_counts,
          categoryPercentage: 1.0,
          barPercentage: 1.1,
          backgroundColor: "#CE93D8" // TODO: make dynamic (vuetify)
        }
      ]
    },
    options: {
      scales: {
        xAxes: [
          {
            ticks: {
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
            },
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
