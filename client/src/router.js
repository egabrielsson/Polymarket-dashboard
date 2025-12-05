import { createRouter, createWebHistory } from 'vue-router'

import Login from './views/Login.vue'
import Home from './views/Home.vue'
import BrowseMarkets from './views/BrowseMarkets.vue'
import Account from './views/Account.vue'
import WatchList from './views/WatchList.vue'
import { getStoredSession } from './stores/sessionStore'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: Login },
  { path: '/home', name: 'home', component: Home },
  { path: '/account', name: 'account', component: Account },
  { path: '/markets', name: 'browseMarkets', component: BrowseMarkets },
  { path: '/watchlist', name: 'watchlist', component: WatchList }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const session = getStoredSession()
  const isLoggedIn = !!session?.id
  const publicRoutes = ['login']

  if (!isLoggedIn && !publicRoutes.includes(to.name)) {
    next({ name: 'login' })
    return
  }

  if (isLoggedIn && to.name === 'login') {
    next({ name: 'browseMarkets' })
    return
  }

  next()
})

export default router
