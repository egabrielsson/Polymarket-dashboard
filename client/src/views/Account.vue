<template>
  <section class="account-view">
    <div class="d-flex justify-content-between align-items-center mb-3 gap-3">
      <div>
        <h1 class="h4 fw-semibold mb-1">My Account</h1>
      </div>
      <b-button variant="outline-secondary" size="sm" @click="refresh">
        Refresh
      </b-button>
    </div>

    <b-alert v-if="error" variant="danger" show class="mb-3">
      {{ error }}
    </b-alert>

    <div v-if="loading" class="text-muted">Loading account…</div>

    <div v-else-if="!user" class="card p-4 shadow-sm">
      <p class="mb-2">You are logged out.</p>
      <RouterLink class="btn btn-primary" :to="{ name: 'login' }">
        Go to Login
      </RouterLink>
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div
          class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4"
        >
          <div>
            <p class="small mb-1">Account ID</p>
            <p class="mono mb-0">{{ user.id }}</p>
          </div>
          <div>
            <p class="small mb-1">Username</p>
            <p class="fw-semibold mb-0">{{ user.username }}</p>
          </div>
        </div>

        <hr />

        <h2 class="h6 mb-2">Update username</h2>
        <p class="text-muted small mb-3">
          Usernames are only cosmetic. The Account ID is your unique identifier.
        </p>
        <b-form @submit.prevent="handleUpdate">
          <b-row class="g-3 align-items-end">
            <b-col cols="12" md="8">
              <b-form-group label="New username" label-for="newUsernameInput">
                <b-form-input
                  id="newUsernameInput"
                  v-model="newUsername"
                  placeholder="market-maker"
                />
              </b-form-group>
            </b-col>
            <b-col cols="12" md="4">
              <b-button
                type="submit"
                variant="primary"
                class="w-100"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Save username
              </b-button>
            </b-col>
          </b-row>
        </b-form>
      </div>
    </div>
  </section>
</template>

<script>
import { Api } from '@/Api'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

export default {
  name: 'AccountView',
  data() {
    return {
      user: sessionStore.session.user,
      newUsername: sessionStore.session.user?.username || '',
      loading: false,
      error: ''
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    async refresh() {
      const storedUser = sessionStore.session.user
      if (!storedUser) {
        this.$router.push({ name: 'login' })
        return
      }
      this.loading = true
      this.error = ''
      try {
        const { data } = await Api.get(`/users/${storedUser.id}`)
        const user = data?.data
        if (user?.id) {
          this.user = { id: user.id, username: user.username }
          this.newUsername = user.username
          sessionStore.setUser(this.user)
        }
      } catch (err) {
        console.error('Failed to load account', err)
        this.error = err?.response?.data?.error || 'Unable to load account.'
        this.user = null
      } finally {
        this.loading = false
      }
    },
    async handleUpdate() {
      if (!this.user?.id) return
      const trimmed = this.newUsername.trim()
      if (!trimmed) {
        this.error = 'Username cannot be empty'
        return
      }
      this.loading = true
      this.error = ''
      try {
        const { data } = await Api.patch(`/users/${this.user.id}`, {
          newUsername: trimmed
        })
        if (data?.userId) {
          const updatedUser = { id: data.userId, username: data.username }
          this.user = updatedUser
          this.newUsername = updatedUser.username
          sessionStore.setUser(updatedUser)
        }
      } catch (err) {
        console.error('Failed to update username', err)
        this.error = err?.response?.data?.error || 'Unable to update username.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.account-view {
  min-height: calc(100vh - 4rem);
}

.mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background-color: rgba(37, 99, 235, 0.06);
  padding: 0.35rem 0.5rem;
  border-radius: 0.5rem;
  letter-spacing: 0.05em;
}
</style>
