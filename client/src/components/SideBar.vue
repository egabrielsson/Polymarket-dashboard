<template>
  <!-- Sidebar wraps the whole navigation block -->
  <aside
    class="sidebar bg-dark text-white h-100 d-flex flex-column justify-content-start gap-4 p-4"
  >
    <!-- Brand section shows POLY + WATCH with different colors -->
    <div class="sidebar__brand">
      <h1 class="h5 fw-semibold mb-1">
        <span class="sidebar__brand-primary">POLY</span>
        <span class="sidebar__brand-accent">WATCH</span>
      </h1>
      <p class="text-white-50 mb-0 small">Navigate markets quickly</p>
    </div>
    <!-- Bootstrap nav that stacks or stretches depending on screen size -->
    <nav class="nav flex-column flex-sm-row flex-md-column gap-2 w-100">
      <RouterLink
        class="nav-link sidebar__link text-white text-center text-md-start flex-fill"
        active-class="sidebar__link--active"
        :to="{ name: 'account' }"
      >
        My Account
      </RouterLink>
      <!-- Link takes the user to the Browse Markets view -->
      <RouterLink
        class="nav-link sidebar__link text-white text-center text-md-start flex-fill"
        active-class="sidebar__link--active"
        :to="{ name: 'browseMarkets' }"
      >
        Browse Markets
      </RouterLink>
      <!-- Shortcut to the Watchlist view -->
      <RouterLink
        class="nav-link sidebar__link text-white text-center text-md-start flex-fill"
        active-class="sidebar__link--active"
        :to="{ name: 'watchlist' }"
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/sessionStore'

export default {
  name: 'SideBar',
  setup() {
    const router = useRouter()
    const sessionStore = useSessionStore()
    onMounted(() => {
      sessionStore.refresh()
    })
    const user = computed(() => sessionStore.session.user)

    const handleLogout = () => {
      sessionStore.clearUser()
      router.push({ name: 'login' })
    }

    return { user, handleLogout }
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
</style>
