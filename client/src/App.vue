<template>
  <div id="app">
    <!-- Temporarily focusing on the Browse Markets experience 
    we just add the other views that we want to display here
    -->
    <BrowseMarkets />
    <!-- <router-view/> -->
  </div>
</template>

<script>
import BrowseMarkets from './views/browseMarkets.vue'

export default {
  name: 'App',
  components: {
    BrowseMarkets
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
