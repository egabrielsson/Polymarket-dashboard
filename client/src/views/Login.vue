<template>
  <section class="auth container py-5">
    <div class="row justify-content-center mb-4">
      <div class="col-lg-8 text-center">
        <h1 class="display-6 fw-semibold mb-2">Welcome to PolyWatch</h1>
        <p class="text-muted mb-0">
          Create an account instantly, or sign in with your ID.
        </p>
      </div>
    </div>

    <div class="auth-stack mx-auto">
      <div class="card shadow-sm auth-card order-1">
        <div class="card-body">
          <h2 class="h5 mb-2">Sign In</h2>
          <p class="text-muted small mb-3">Use your 16-digit account id.</p>
          <b-alert
            v-if="loginError"
            variant="danger"
            show
            class="py-2 small mb-3"
          >
            {{ loginError }}
          </b-alert>
          <b-form @submit.prevent="handleLogin">
            <b-form-group label="Account ID" label-for="idInput">
              <b-form-input
                id="idInput"
                v-model="loginId"
                placeholder="A1B2C3D4E5F6G7H8"
                maxlength="16"
                autocomplete="off"
                spellcheck="false"
              />
            </b-form-group>
            <b-button
              type="submit"
              variant="outline-primary"
              class="w-100"
              :disabled="loggingIn"
            >
              <span
                v-if="loggingIn"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Sign In
            </b-button>
          </b-form>
        </div>
      </div>

      <div class="card shadow-sm auth-card order-2">
        <div class="card-body">
          <h2 class="h5 mb-2">Create Account</h2>
          <p class="text-muted small mb-3">
            We generate a 16-digit id and sign you in immediately.
          </p>
          <b-alert
            v-if="createError"
            variant="danger"
            show
            class="py-2 small mb-3"
          >
            {{ createError }}
          </b-alert>
          <b-alert
            v-if="createdMessage"
            variant="success"
            show
            class="py-2 small mb-3"
          >
            {{ createdMessage }}
          </b-alert>
          <b-form @submit.prevent="handleCreate">
            <b-form-group
              label="Cosmetic username (optional)"
              label-for="usernameInput"
            >
              <b-form-input
                id="usernameInput"
                v-model="desiredUsername"
                placeholder="user42"
                autocomplete="username"
              />
            </b-form-group>
            <b-button
              type="submit"
              variant="primary"
              class="w-100"
              :disabled="creating"
            >
              <span
                v-if="creating"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Create & Sign In
            </b-button>
          </b-form>
        </div>
      </div>
    </div>

    <p class="text-center text-muted small mt-4 mb-0">
      Store your unique ID safely, it is the only key to your account.
    </p>
  </section>
</template>

<script>
import { Api } from '@/Api'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

export default {
  name: 'LoginView',
  data() {
    return {
      desiredUsername: '',
      loginId: '',
      creating: false,
      loggingIn: false,
      createError: '',
      loginError: '',
      createdMessage: ''
    }
  },
  mounted() {
    if (sessionStore.session.user) {
      this.$router.push({ name: 'browseMarkets' })
    }
  },
  methods: {
    async handleCreate() {
      this.creating = true
      this.createError = ''
      this.createdMessage = ''
      try {
        const payload = {}
        if (this.desiredUsername && this.desiredUsername.trim()) {
          payload.username = this.desiredUsername.trim()
        }
        const { data } = await Api.post('/users', payload)
        const user = data?.user
        if (user?.id) {
          sessionStore.setUser({ id: user.id, username: user.username })
          this.createdMessage = `Account created. Your ID is ${user.id}`
          this.desiredUsername = ''
          this.loginId = user.id
          this.$router.push({ name: 'browseMarkets' })
        } else {
          this.createError = 'Unexpected response creating account.'
        }
      } catch (err) {
        console.error('Failed to create account', err)
        this.createError =
          err?.response?.data?.error || 'Unable to create account right now.'
      } finally {
        this.creating = false
      }
    },
    async handleLogin() {
      this.loggingIn = true
      this.loginError = ''
      try {
        const trimmedId = this.loginId.trim()
        const { data } = await Api.post('/sessions', { id: trimmedId })
        if (data?.userId) {
          sessionStore.setUser({ id: data.userId, username: data.username })
          this.$router.push({ name: 'browseMarkets' })
        } else {
          this.loginError = 'Unexpected response logging in.'
        }
      } catch (err) {
        console.error('Failed to log in', err)
        this.loginError = err?.response?.data?.error || 'Login failed.'
      } finally {
        this.loggingIn = false
      }
    }
  }
}
</script>

<style scoped>
.auth {
  max-width: 1100px;
}

.auth-stack {
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-card {
  width: 100%;
}
</style>
