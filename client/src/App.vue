<template>
  <div id="app" class="container-fluid p-0">
    <div class="row g-0 min-vh-100 flex-md-nowrap">
      <div class="col-12 col-md-3 col-xl-2">
        <SideBar />
      </div>
      <main class="col bg-light py-4 px-3 px-md-5">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import SideBar from './components/SideBar.vue'

export default {
  name: 'App',
  components: {
    SideBar
  }
}
</script>

<style>
:root {
  --poly-blue: #2563eb;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2933;
  background-color: #f5f7fb;
}

main {
  min-height: 100vh;
}
</style>
