import { BarController, BarElement, CategoryScale, Chart, LinearScale } from "chart.js";

Chart.register(BarController, LinearScale, BarElement, CategoryScale);

export default function (graph: Chart | null, ctx: CanvasRenderingContext2D, data: any) {
  const textColor = "rgba(255, 255, 255, 1.0)";
  const gridColor = "rgba(255, 255, 255, 0.2)";
  const barColor = "rgba(178, 223, 219, 1)";
  const series_labels = [...Array(data.length).keys()];
  const datasets = [
    {
      data: data,
      backgroundColor: barColor
    }
  ];

  if (graph) graph.destroy();
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: series_labels,
      datasets: datasets
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        },
        y: {
          ticks: {
            color: textColor,
            maxTicksLimit: 4
          },
          grid: {
            color: gridColor
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      aspectRatio: 1.41
    }
  });
}
