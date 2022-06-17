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
        det_val: false,
        graph: undefined
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
            this.print_deterministic(newVal[0]);
          }
        } else {
          this.print_deterministic(newVal);
        }
      }
    },
    methods: {
      print_deterministic(det_val_raw) {
        this.det_val = det_val_raw.toFixed(
          Math.max(0, 3 - Math.floor(Math.log10(det_val_raw)))
        );
      },
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
        var labels = hist.bins;
        var bins = hist.bin_counts;

        var baseColor = "rgba(255, 255, 255, 1)";
        var baseColor2 = "rgba(255, 255, 255, 0.2)";

        if (this.graph) this.graph.destroy();
        this.graph = Chart.Bar(ctx, {
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
