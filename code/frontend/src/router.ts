import { createRouter, createWebHistory } from 'vue-router'

import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";
import UserArea from "./components/UserArea.vue";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import Workspace from "./components/Workspace.vue";
import FileView from "./components/FileView.vue";
import Test from "./components/Test.vue";

const routes = [
  {
    path: "/user/",
    component: UserArea,
    children: [
      {
        path: "workspace",
        component: Workspace,
        children: [
          {
            path: "",
            redirect: "/user/workspace/modeling"
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
        path: "files",
        component: FileView
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
  },
  {
    path: "/test",
    component: Test
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
