import VueRouter from "vue-router";

import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";
import UserArea from "./components/UserArea.vue";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";

const routes = [
  {
    path: "/workspace/",
    component: UserArea,
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
    component: Login
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
