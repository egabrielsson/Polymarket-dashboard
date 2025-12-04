import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import BrowseMarkets from './views/browseMarkets.vue'
import Account from './views/Account.vue'
import WatchList from './views/WatchList.vue'

const routes = [
  { path: '/', redirect: '/markets' },
  { path: '/home', name: 'home', component: Home },
  { path: '/account', name: 'account', component: Account },
  { path: '/markets', name: 'browseMarkets', component: BrowseMarkets },
  { path: '/watchlist', name: 'watchlist', component: WatchList }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
