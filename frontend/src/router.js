import VueRouter from "vue-router";

import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";
import Workspace from "./Workspace.vue";
import login from "./components/Login.vue";
import Register from "./components/Register.vue";

const routes = [
  {
    path: "/workspace/",
    component: Workspace,
    children: [
      {
        path: "",
        redirect: "modeling"
      },
      {
        path: "modeling",
        component: NodeEditor
      },
      {
        path: "estimates",
        component: EstimatesDashboard
      },
      {
        path: "results",
        component: ResultsDashboard
      },
      {
        path: "code",
        component: CodeDashboard
      }
    ]
  },
  {
    path: "/login/",
    component: login
  },
  {
    path: "/register/",
    component: Register
  },
  {
    path: "/",
    redirect: "/login/"
  }
];

const router = new VueRouter({
  routes, // short for `routes: routes`
  mode: "history"
});

export default router;
