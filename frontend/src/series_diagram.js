import Chart from "chart.js";

export default function(graph, ctx, data) {
  var baseColor = "rgba(255, 255, 255, 1)";
  var baseColor2 = "rgba(255, 255, 255, 0.2)";
  var series_labels = [...Array(data.length).keys()];
  console.log(series_labels);
  var datasets = [
    {
      data: data,
      backgroundColor: "rgba(178, 223, 219, 1)" // TODO: make dynamic (vuetify)
    }
  ];

  if (graph) graph.destroy();
  return Chart.Bar(ctx, {
    data: {
      labels: series_labels,
      datasets: datasets
    },
    options: {
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: baseColor
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
              maxTicksLimit: 4,
              beginAtZero: true
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
