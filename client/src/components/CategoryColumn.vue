<template>
  <article class="category-column card shadow-sm" ref="categoryCard">
    <header
      class="card-header d-flex justify-content-between align-items-center category-header"
      @click="toggleExpanded"
      role="button"
    >
      <div class="d-flex align-items-center gap-2">
        <span class="expand-icon" :class="{ expanded: isExpanded }">&#9654;</span>
        <h2 class="h5 mb-0">{{ category.name }}</h2>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-light text-dark">{{ markets.length }} markets</span>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          @click.stop="emitDelete"
          :disabled="isDeleting()"
        >
          Delete
        </button>
      </div>
    </header>
    <div v-show="isExpanded" class="card-body category-content">
      <div v-if="markets.length" class="watchlist-market-grid">
        <div
          v-for="market in markets"
          :key="market._id"
          class="watchlist-market-card"
        >
          <MarketCard :market="market">
            <template #actions>
              <div class="watchlist-market-actions">
                <select
                  class="form-select form-select-sm"
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
                <MarketNotesModal
                  :market-id="market._id"
                  :market-title="market.title"
                />
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  @click="emitRemove(market)"
                  :disabled="isRemoving(market)"
                >
                  Remove
                </button>
              </div>
            </template>
          </MarketCard>
        </div>
      </div>
      <p v-else class="small mb-0">No markets added yet.</p>
    </div>
  </article>
</template>

<script>
import MarketCard from '@/components/MarketCard.vue'
import MarketNotesModal from '@/components/MarketNotesModal.vue'

export default {
  name: 'CategoryColumn',
  components: {
    MarketCard,
    MarketNotesModal
  },
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
    },
    removingMarkets: {
      type: Object,
      default: () => ({})
    },
    deletingCategories: {
      type: Object,
      default: () => ({})
    },
    isExpanded: {
      type: Boolean,
      default: false
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
    },
    isRemoving(market) {
      if (!market) {
        return false
      }
      return Boolean(this.removingMarkets[market._id])
    },
    emitRemove(market) {
      this.$emit('remove-market', market._id)
    },
    isDeleting() {
      return Boolean(this.deletingCategories[this.category._id])
    },
    emitDelete() {
      this.$emit('delete-category', this.category._id)
    },
    toggleExpanded() {
      this.$emit('toggle-expand', this.category._id)
    }
  },
  watch: {
    isExpanded(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.categoryCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }
  }
}
</script>

<style scoped>
.category-column {
  min-width: 0;
  width: 100%;
  position: relative;
}

.category-header {
  cursor: pointer;
  user-select: none;
}

.category-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.category-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.expand-icon {
  display: inline-block;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  color: #1f2933;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.watchlist-market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 1rem;
}

.watchlist-market-card {
  width: 100%;
}

.watchlist-market-actions {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.watchlist-market-actions select {
  flex: 1;
}
</style>

