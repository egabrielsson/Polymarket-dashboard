<template>
  <!-- Mobile: full-width top bar -->
  <div class="mobile-nav d-md-none">
    <div class="mobile-nav__bar bg-dark d-flex justify-content-between align-items-center px-3 py-2">
      <span class="mobile-nav__brand text-white fw-semibold">
        <span>POLY</span><span class="text-primary">WATCH</span>
      </span>
      <button class="btn btn-outline-light btn-sm mobile-nav__toggle" @click="isOpen = !isOpen">
        ☰
      </button>
    </div>
    <div v-if="isOpen" class="mobile-nav__dropdown bg-dark">
      <RouterLink class="mobile-nav__link" :to="{ name: 'account' }" @click="isOpen = false">My Account</RouterLink>
      <RouterLink class="mobile-nav__link" :to="{ name: 'browseMarkets' }" @click="isOpen = false">Browse Markets</RouterLink>
      <RouterLink class="mobile-nav__link" :to="{ name: 'watchlist' }" @click="isOpen = false">Watchlist</RouterLink>
      <div class="mobile-nav__session">
        <span v-if="user" class="text-white-50 small">{{ user.username }}</span>
        <button v-if="user" class="btn btn-sm btn-outline-light" @click="handleLogout">Logout</button>
        <RouterLink v-else class="btn btn-sm btn-outline-light" :to="{ name: 'login' }" @click="isOpen = false">Login</RouterLink>
      </div>
    </div>
  </div>

  <!-- Desktop: full sidebar -->
  <aside class="sidebar bg-dark text-white h-100 d-none d-md-flex flex-column justify-content-start gap-4 p-4">
    <!-- Brand section shows POLY + WATCH with different colors -->
    <div class="sidebar__brand">
      <h1 class="h5 fw-semibold mb-1">
        <span class="sidebar__brand-primary">POLY</span>
        <span class="sidebar__brand-accent">WATCH</span>
      </h1>
      <p class="text-white-50 mb-0 small">Navigate markets</p>
    </div>
    <!-- Bootstrap nav that stacks or stretches depending on screen size -->
    <nav class="nav flex-column flex-sm-row flex-md-column gap-2 w-100">
      <RouterLink
        class="nav-link sidebar__link text-white text-center text-md-start flex-fill"
        active-class="sidebar__link--active"
        :to="{ name: 'account' }"
        @click="isOpen = false"
      >
        My Account
      </RouterLink>
      <!-- Link takes the user to the Browse Markets view -->
      <RouterLink
        class="nav-link sidebar__link text-white text-center text-md-start flex-fill"
        active-class="sidebar__link--active"
        :to="{ name: 'browseMarkets' }"
        @click="isOpen = false"
      >
        Browse Markets
      </RouterLink>
      <!-- Shortcut to the Watchlist view -->
      <RouterLink
        class="nav-link sidebar__link text-white text-center text-md-start flex-fill"
        active-class="sidebar__link--active"
        :to="{ name: 'watchlist' }"
        @click="isOpen = false"
      >
        Watchlist
      </RouterLink>
    </nav>
    <div class="sidebar__session mt-auto pt-3 border-top border-secondary">
      <div v-if="user" class="d-flex flex-column gap-1">
        <span class="text-white-50 small">Signed in as</span>
        <span class="fw-semibold">{{ user.username || user.id }}</span>
        <button
          class="btn btn-sm btn-outline-light align-self-start"
          type="button"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
      <RouterLink
        v-else
        class="btn btn-sm btn-outline-light"
        :to="{ name: 'login' }"
      >
        Login
      </RouterLink>
    </div>
  </aside>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'

export default {
  name: 'SideBar',
  setup() {
    const router = useRouter()
    const sessionStore = useSessionStore()
    const isOpen = ref(false)

    onMounted(() => {
      sessionStore.refresh()
    })
    const user = computed(() => sessionStore.session.user)

    const handleLogout = () => {
      isOpen.value = false
      sessionStore.clearUser()
      router.push({ name: 'login' })
    }

    return { user, handleLogout, isOpen }
  }
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 1.5rem;
}

.sidebar__brand {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* POLY text stays slightly smaller so WATCH feels more prominent */
.sidebar__brand-primary {
  display: inline-block;
  font-size: 0.95em;
}

.sidebar__brand-accent {
  color: var(--poly-blue);
  display: inline-block;
  font-size: 1.2em;
  line-height: 1;
}

/* Links share the same rounded pill look all over the app */
.sidebar__link {
  border-radius: 0.75rem;
  padding: 0.6rem 1rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar__link:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.sidebar__link--active {
  background-color: var(--poly-blue);
  color: #f8fafc;
}

/* Mobile full-width top bar */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

.mobile-nav__bar {
  width: 100%;
}

.mobile-nav__brand {
  font-size: 1.1rem;
  letter-spacing: 0.05em;
}

.mobile-nav__toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.mobile-nav__dropdown {
  border-radius: 0 0 0.5rem 0.5rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav__link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.mobile-nav__link:hover,
.mobile-nav__link.router-link-active {
  background: var(--poly-blue);
}

.mobile-nav__session {
  padding-top: 0.5rem;
  margin-top: 0.25rem;
  border-top: 1px solid rgba(255,255,255,0.2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
