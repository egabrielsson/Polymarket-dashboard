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

    <b-col cols="12" md="6" class="d-flex align-items-end">
        <b-button
            variant="primary" 
            class="p-3 d-block w-100 w-md-25 mb-4"
            @click="$router.push({ name: 'account' })"
        >
            Login
        </b-button>
    </b-col>
    
    <b-col cols="12" md="6" class="d-flex align-items-end">
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

















</script>
