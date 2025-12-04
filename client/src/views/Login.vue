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

    <h1 
        class="display-6 fw-semibold mb-0 p-1">ID String
    </h1>

        <b-form-input v-model="text" 
        placeholder="Enter your ID String"
        class="mb-5 w-100 w-md-25"
        >
    </b-form-input>

    <b-col cols="12" md="6">
        <b-button
            variant="primary"
            class="p-3 d-block w-100 w-md-25 mb-4"
            :disabled="loading"
            @click="login"
        >
            {{ loading ? 'Logging in…' : 'Login' }}
        </b-button>
    </b-col>

    <div v-if="error" class="text-danger mt-2">
        {{ error }}
    </div>
    
    <b-col cols="12" md="6">
        <b-button
            variant="success" 
            class="p-3 d-block w-100 w-md-25 mb-4"
            @click="$router.push({ name: 'register' })"
        >
            Register
        </b-button>
    </b-col>
    


    

  </b-container>
</template>

<script>
import { Api } from '@/Api'

const LOCAL_STORAGE_USER_ID_KEY = 'user_id'

export default {
  name: 'LoginView',

  data() {
    return {
      text: '',       
      loading: false,
      error: ''
    }
  },

  created() {

    const storedId = window.localStorage.getItem(LOCAL_STORAGE_USER_ID_KEY)
    if (storedId && !this.text) {
      this.text = storedId
    }
  },

  methods: {
    async login() {
      this.error = ''

      const id = this.text.trim()
      if (!id) {
        this.error = 'ID string is required.'
        return
      }

      this.loading = true
      try {
 
        const { data } = await Api.post('/sessions', { id })



        const userId = data?.userId
        if (!userId) {
            throw new Error('No user id returned from API')
        }

   
        window.localStorage.setItem(LOCAL_STORAGE_USER_ID_KEY, userId)

     
        this.$router.push({ name: 'account' })
        } catch (err) {
            console.error('Failed to log in', err)
            this.error =
            err?.response?.data?.error ||
            err.message ||
            'Login failed. Please check your ID and try again.'
        } finally {
            this.loading = false
        }
        }
    }
}
</script>
