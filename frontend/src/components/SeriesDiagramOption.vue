<template>
  <div class="diagram_container">
    <!--<span v-show="det_val !== false">Deterministic: {{ det_val }}</span>-->
    <canvas :class="{ hide: !is_data }" id="hist" ref="hist" />
  </div>
</template>

<script>
  import series_diagram from "../series_diagram";
  import nj from "numjs";

  export default {
    props: {
      value: {
        type: Object,
        default() {
          return [];
        }
      }
    },
    data() {
      return {
        is_data: false,
        graph: undefined
      };
    },
    watch: {
      value: function(newVal) {
        if (Array.isArray(newVal.value) && typeof newVal.value[0] == "object") {
          this.is_data = true;
          this.draw_diagram();
        } else {
          this.is_data = false;
        }
      }
    },
    methods: {
      draw_diagram() {
        var ctx = this.$refs.hist.getContext("2d");
        var mc = this.value.value;
        if (mc.length > 0 && typeof mc[0] == "object") {
          if (this.value.use_average) {
            var averages = nj.zeros([mc[0].shape[0]]);
            mc.forEach(e => {
              averages = averages.add(e);
            });
            averages = averages.divide(mc.length);
            var data = averages.tolist();
          } else {
            var data = mc[0].tolist();
          }
          this.graph = series_diagram(this.graph, ctx, data);
        }
      }
    }
  };
</script>

<style>
  canvas.hide {
    /* for some reason v-show did not work*/
    display: none !important;
  }
</style>
