<template>
  <article class="category-column card h-100 shadow-sm">
    <header class="card-header d-flex justify-content-between align-items-center">
      <div>
        <p class="text-uppercase text-muted fw-semibold small mb-1">Category</p>
        <h2 class="h5 mb-0">{{ category.name }}</h2>
      </div>
      <span class="badge bg-light text-dark">{{ markets.length }} markets</span>
    </header>
    <div class="card-body">
      <div v-for="market in markets" :key="market._id" class="market-chip">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h3 class="h6 mb-1">{{ market.title }}</h3>
            <p class="text-muted small mb-0">
              Polymarket ID: {{ market.polymarketId }}
            </p>
          </div>
          <span class="badge bg-secondary align-self-start">
            {{ market.categoryId ? 'Assigned' : 'Uncategorized' }}
          </span>
        </div>
        <label class="visually-hidden" :for="`category-${market._id}`">
          Move {{ market.title }} to category
        </label>
        <select
          class="form-select form-select-sm mt-2"
          :id="`category-${market._id}`"
          :value="selectedCategoryId(market)"
          @change="handleCategoryChange(market._id, $event.target.value)"
        >
          <option value="">Uncategorized</option>
          <option
            v-for="option in categoryOptions"
            :key="option._id"
            :value="option._id"
          >
            {{ option.name }}
          </option>
        </select>
      </div>
      <p v-if="!markets.length" class="text-muted small mb-0">No markets added yet.</p>
    </div>
  </article>
</template>

<script>
export default {
  name: 'CategoryColumn',
  props: {
    category: {
      type: Object,
      required: true
    },
    markets: {
      type: Array,
      default: () => []
    },
    allCategories: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    categoryOptions() {
      return this.allCategories.filter((cat) => cat._id !== this.category._id)
    }
  },
  methods: {
    selectedCategoryId(market) {
      const categoryId = market.categoryId
      if (!categoryId) {
        return ''
      }
      if (typeof categoryId === 'object') {
        return categoryId?._id || categoryId?.$oid || ''
      }
      return categoryId
    },
    handleCategoryChange(marketId, targetCategoryId) {
      this.$emit('update-category', {
        marketId,
        fromCategoryId: this.category._id,
        categoryId: targetCategoryId || null
      })
    }
  }
}
</script>

<style scoped>
.category-column {
  min-width: 280px;
}

.card-body {
  max-height: 80vh;
  overflow-y: auto;
}

.market-chip {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background-color: #fff;
}
</style>

