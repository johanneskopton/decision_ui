<script setup lang="ts">
  import InresLogo from "../../../resources/images/inres.webp";
  import UniBonnLogo from "../../../resources/images/uni-bonn.webp";
  import NifamLogo from "../../../resources/images/nifam.webp";
  import FundingLogo from "../../../resources/images/funding.webp";
  import DsuiLogo from "../../../resources/images/logo_large.svg";
</script>

<template>
  <div class="container">
    <div class="header">
      <div>
        <a href="https://www.gartenbauwissenschaften.uni-bonn.de/" target="_blank">
          <img :src="InresLogo" class="inresLogo" />
        </a>
      </div>
      <div>
        <a href="https://www.uni-bonn.de/" target="_blank"><img :src="UniBonnLogo" class="uniBonnLogo" /></a>
      </div>
    </div>
    <div class="content">
      <div class="heading">
        <div><DsuiLogo /></div>
        <h1 v-if="false">Decision Support User Interface</h1>
      </div>
      <div class="menu">
        <div>
          <v-btn to="/user/workspace/help/getting-started" class="menuButton">
            <template #prepend>
              <v-icon size="32px"> mdi-school-outline </v-icon>
            </template>
            <template #default>getting started</template>
          </v-btn>
        </div>
        <div>
          <v-btn to="/user/files?examples=1" class="menuButton">
            <template #prepend>
              <v-icon size="32px"> mdi-format-list-text </v-icon>
            </template>
            <template #default> examples</template>
          </v-btn>
        </div>
        <div>
          <v-btn to="/login" class="menuButton">
            <template #prepend>
              <v-icon size="32px"> mdi-login </v-icon>
            </template>
            <template #default>login</template>
          </v-btn>
        </div>
        <div>
          <v-btn to="/user/workspace/modeling" class="menuButton">
            <template #prepend>
              <v-icon size="32px"> mdi-graph mdi-rotate-90 </v-icon>
            </template>
            <template #default>model editor</template>
          </v-btn>
        </div>
      </div>
    </div>
    <div class="footer">
      <div>
        <a href="https://www.gartenbauwissenschaften.uni-bonn.de/en/research/hollistic-modeling/nifam" target="_blank">
          <img :src="NifamLogo" class="nifamLogo" />
        </a>
      </div>
      <div><img :src="FundingLogo" class="fundingLogo" /></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .header {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .inresLogo {
      display: block;
      margin: 2em 0 0 2em;
      width: 8em;
    }

    .uniBonnLogo {
      display: block;
      margin: 2em 2em 0 0;
      width: 200px;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2em;
  }

  .heading {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2em;
    padding: 0 2em;

    svg {
      width: 100%;
      height: auto;
    }

    h1 {
      color: #00519e;
    }
  }

  .menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0 2em;
    gap: 1em;

    .menuButton {
      display: flex;
      flex-direction: column;
      gap: 1em;
      height: 8em;
      min-width: 12em;
      padding: 1em 1.5em;
    }
  }

  .footer {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: flex-end;

    .nifamLogo {
      display: block;
      margin: 0 0 2em 2em;
      width: 12em;
    }

    .fundingLogo {
      display: block;
      margin: 0 1em 1.5em 0;
      width: 20em;
    }
  }
</style>
