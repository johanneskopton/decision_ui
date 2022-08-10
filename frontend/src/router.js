import VueRouter from "vue-router";

import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";

const routes = [
  {
    path: "/",
    redirect: "/modeling"
  },
  {
    path: "/modeling",
    component: NodeEditor
  },
  {
    path: "/estimates",
    component: EstimatesDashboard
  },
  {
    path: "/results",
    component: ResultsDashboard
  },
  {
    path: "/code",
    component: CodeDashboard
  }
];

const router = new VueRouter({
  routes, // short for `routes: routes`
  mode: "history"
});

export default router;
