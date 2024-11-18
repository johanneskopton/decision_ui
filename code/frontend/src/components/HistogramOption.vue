<template>
  <div class="hist_container">
    <span v-show="det_val !== false">Deterministic: {{ det_val }}</span>
    <canvas :class="is_prob" id="hist" ref="hist" />
  </div>
</template>

<script>
  import get_bins from "../get_bins";
  import histogram from "../histogram";

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
        is_prob: "prob",
        graph: undefined
      };
    },
    watch: {
      value: function(newVal) {
        if (Array.isArray(newVal)) {
          if (new Set(newVal).size > 1) {
            this.det_val = false;
            this.is_prob = "prob";
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
        const approximatelyEqual = (v1, v2, epsilon = 0.001) =>
          Math.abs(v1 - v2) < epsilon;
        this.det_val = approximatelyEqual(det_val_raw, 0)
          ? 0
          : det_val_raw.toFixed(
              Math.max(0, 3 - Math.floor(Math.log10(det_val_raw)))
            );
        this.is_prob = "det";
      },
      draw_hist() {
        var ctx = this.$refs.hist.getContext("2d");
        var data = this.value;
        function range(start, end, step = 1) {
          const len = Math.floor((end - start) / step) + 1;
          return Array(len)
            .fill()
            .map((_, idx) => start + idx * step);
        }

        var hist_data = get_bins(data);
        var bins = hist_data.bins;
        var bin_counts = hist_data.bin_counts;
        this.graph = histogram(this.graph, ctx, bins, bin_counts, true);
      }
    }
  };
</script>

<style>
  canvas.det {
    /* for some reason v-show did not work*/
    display: none !important;
  }
</style>
