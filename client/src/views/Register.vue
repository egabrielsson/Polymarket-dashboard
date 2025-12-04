<template>
  <b-container fluid class="py-4">
    <div
      class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4"
    >
      <div>
        <h1 class="display-6 fw-semibold mb-0">Login</h1>
        <p class="text-muted mb-0">Sign in or Sign up!</p>
      </div>
      <div class="d-flex gap-2">
        <b-button
          variant="outline-secondary"
          @click="$router.push({ name: 'home' })"
        >
          Home
        </b-button>
      </div>
    </div>

    <h1 class="display-6 fw-semibold mb-0 p-1">
      Username
    </h1>

    <!-- bind to "username" -->
    <b-form-input
      v-model="username"
      placeholder="Enter your wanted Username"
      class="mb-3 w-100 w-md-25"
    />

    <!-- Register button calls register() -->
    <b-col cols="12" md="6">
      <b-button
        variant="success"
        class="p-3 d-block w-100 w-md-25 mb-3"
        :disabled="loading"
        @click="register"
      >
        {{ loading ? 'Registering...' : 'Register' }}
      </b-button>
    </b-col>

    <!-- Login button unchanged -->
    <b-col cols="12" md="6">
      <b-button
        variant="primary"
        class="p-3 d-block w-100 w-md-25 mb-4"
        @click="$router.push({ name: 'login' })"
      >
        Login
      </b-button>
    </b-col>


    <div
        v-if="generatedId"
        class="alert alert-success mt-2"
    >
        Your ID: <strong>{{ generatedId }}</strong>
    </div>


    <div
        v-else-if="error"
        class="text-danger mt-2"
    >
        {{ error }}
    </div>

  </b-container>
</template>

<script>
import { Api } from '@/Api'

const LOCAL_STORAGE_USER_ID_KEY = 'user_id'

export default {
  name: 'RegisterView',

  data() {
    return {
      username: '',
      activeUserId: '',
      generatedId: '',
      loading: false,
      error: ''
    }
  },

  created() {

    const storedId = window.localStorage.getItem(LOCAL_STORAGE_USER_ID_KEY)
    if (storedId) {
      this.activeUserId = storedId
      this.generatedId = storedId
    }
  },

  methods: {
    async register() {
      this.error = ''
      this.generatedId = ''

      const trimmed = this.username.trim()
      if (!trimmed) {
        this.error = 'Username is required.'
        return
      }

      this.loading = true
      try {
        const payload = { username: trimmed }

        // /api/users 
        const { data } = await Api.post('/users', payload)
        console.log('Register response:', data)

        const userId = data?.user?.id

        if (!userId) {
          throw new Error('No user id returned from API')
        }

        this.activeUserId = userId
        this.generatedId = userId


        window.localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, userId)


      } catch (err) {
        console.error('Failed to register user', err)
        this.error =
          err?.response?.data?.error ||
          err.message ||
          'Registration failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
