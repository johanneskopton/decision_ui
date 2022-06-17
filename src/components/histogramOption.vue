<template>
  <div class="hist_container">
    <span v-if="det_val">Deterministic: {{ det_val }}</span>
    <canvas v-if="!det_val" id="hist" ref="hist" width="181" max-height="140" />
  </div>
</template>

<script>
  import Chart from "chart.js";
  import histogram from "../histogram-pretty";

  export default {
    props: {
      value: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    data() {
      return {
        det_val: false
      };
    },
    watch: {
      value: function(newVal, oldVal) {
        // watch it
        console.log("Prop changed: ", newVal, " | was: ", oldVal);
        if (Array.isArray(newVal)) {
          if (new Set(newVal).size > 1) {
            this.det_val = false;
            this.draw_hist();
          } else {
            this.det_val = newVal[0];
          }
        } else {
          this.det_val = newVal;
        }
      }
    },
    methods: {
      print_deterministic() {},
      draw_hist() {
        console.log(this.value);
        var ctx = this.$refs.hist.getContext("2d");
        var data = this.value;
        function range(start, end, step = 1) {
          const len = Math.floor((end - start) / step) + 1;
          return Array(len)
            .fill()
            .map((_, idx) => start + idx * step);
        }

        var hist = histogram(data);
        var binRange = hist.tickRange();
        console.log(binRange);
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
                    maxRotation: 90,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 7,
                    fontColor: baseColor,
                    callback: function(value, index, values) {
                      var tickDistance = values[1] - values[0];
                      var numDecimal =
                        -1 * Math.floor(Math.log10(tickDistance));
                      numDecimal = Math.max(numDecimal - 1, 0);
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
    }
  };
</script>
