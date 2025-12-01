import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import BrowseMarkets from './views/browseMarkets.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/markets', name: 'browseMarkets', component: BrowseMarkets }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
