import { createRouter, createWebHistory } from "vue-router";

import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";
import UserArea from "./components/UserArea.vue";
import LoginForm from "./components/LoginForm.vue";
import RegistrationForm from "./components/RegistrationForm.vue";
import Workspace from "./components/Workspace.vue";
import FileView from "./components/FileView.vue";

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
    component: LoginForm
  },
  {
    path: "/register/",
    component: RegistrationForm
  },
  {
    path: "/",
    redirect: "/login/"
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
