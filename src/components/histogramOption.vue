<template>
  <canvas id="hist" ref="hist" width="181" max-height="140" />
</template>

<script>
  import Chart from "chart.js";
  import histogram from "../histogram-pretty";

  export default {
    data() {
      return {};
    },
    mounted() {
      var ctx = this.$refs.hist.getContext("2d");
      var data = [
        2,
        3,
        6,
        7,
        9,
        5,
        3,
        4,
        6,
        8,
        6,
        5,
        3,
        3,
        2,
        2,
        2,
        11,
        4,
        6,
        8,
        0,
        8,
        6,
        3,
        5,
        7,
        5,
        4,
        2,
        2,
        6,
        8,
        9,
        6,
        4,
        2,
        2,
        2,
        22,
        2,
        5,
        9,
        0
      ];

      function range(start, end, step = 1) {
        const len = Math.floor((end - start) / step) + 1;
        return Array(len)
          .fill()
          .map((_, idx) => start + idx * step);
      }

      var hist = histogram(data);
      var binRange = hist.tickRange();
      var labels = range(binRange[0], Math.round(binRange[1]), binRange[2]);
      var bins = Array(labels.length).fill(0);

      for (var i = 0; i < data.length; i++) {
        var value = data[i];
        var index = labels.indexOf(hist.fun(value));
        bins[index] = bins[index] + 1;
      }

      var baseColor = "rgba(255, 255, 255, 1)";
      var baseColor2 = "rgba(255, 255, 255, 0.2)";

      var myBarChart = Chart.Bar(ctx, {
        data: {
          labels: labels,
          datasets: [
            {
              data: bins,
              categoryPercentage: 1.0,
              barPercentage: 1.0,
              backgroundColor: "#CE93D8"
            }
          ]
        },
        options: {
          scales: {
            xAxes: [
              {
                ticks: {
                  maxRotation: 0,
                  minRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 7,
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
                  fontColor: baseColor
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
          }
        }
      });
    }
  };
</script>
