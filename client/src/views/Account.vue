<template>
  <section class="placeholder-view">
    <div class="placeholder-view__content">
      <h1>Hello World</h1>
      <p>Under Development.</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AccountView'
}
</script>

<style scoped>
.placeholder-view {
  min-height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-view__content {
  text-align: center;
}

.placeholder-view__content h1 {
  margin-bottom: 0.5rem;
}
</style>
