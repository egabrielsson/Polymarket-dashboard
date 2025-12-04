<template>
  <b-container fluid class="py-4 watchlist-view">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1 class="display-6 fw-semibold mb-0">Watchlist</h1>
        <p class="text-muted mb-0">Organize your saved markets by category</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <b-button
          variant="outline-secondary"
          @click="loadData"
          :disabled="loadingCategories"
        >
          Refresh
        </b-button>
        <b-button
          variant="primary"
          @click="handleCreateCategory"
          :disabled="creatingCategory"
        >
          <span
            v-if="creatingCategory"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          />
          Create Category
        </b-button>
      </div>
    </div>

    <b-alert v-if="!activeUserId" variant="warning" show class="mb-4">
      Provide <code>VITE_TEST_USER_ID</code> in your <code>.env</code> so we can
      load the stored watchlist.
    </b-alert>

    <div v-if="categoryError" class="alert alert-danger" role="alert">
      {{ categoryError }}
    </div>
    <div v-else-if="loadingCategories" class="text-muted">
      Loading categories…
    </div>
    <div v-else>
      <div v-if="!categories.length" class="empty-state card p-4 text-center">
        <p class="mb-1 fw-semibold">No categories yet</p>
        <p class="text-muted mb-0">
          Create your first category to start organizing markets.
        </p>
      </div>
      <div v-else class="category-grid">
        <CategoryColumn
          v-for="category in categories"
          :key="category._id"
          :category="category"
          :markets="category.markets"
          :all-categories="categoryOptions"
          :removing-markets="removingMarkets"
          @update-category="handleAssignCategory"
          @remove-market="handleRemoveMarket"
        />
      </div>
    </div>
  </b-container>
</template>

<script>
import CategoryColumn from '@/components/CategoryColumn.vue'
import { Api } from '@/Api'

const DEFAULT_USER_ID = import.meta.env.VITE_TEST_USER_ID || ''

export default {
  name: 'WatchListView',
  components: {
    CategoryColumn
  },
  data() {
    return {
      categories: [],
      loadingCategories: false,
      creatingCategory: false,
      categoryError: '',
      activeUserId: DEFAULT_USER_ID,
      removingMarkets: {}
    }
  },
  computed: {
    categoryOptions() {
      return this.categories.map(({ _id, name }) => ({
        _id,
        name
      }))
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loadingCategories = true
      this.categoryError = ''
      try {
        const [categories, watchlist] = await Promise.all([
          this.fetchCategories(),
          this.fetchWatchlist()
        ])
        this.categories = this.combineCategoriesWithMarkets(
          categories,
          watchlist
        )
      } catch (err) {
        console.error('Failed to load watchlist data', err)
        this.categoryError =
          err?.response?.data?.error ||
          'Unable to load watchlist data right now.'
      } finally {
        this.loadingCategories = false
      }
    },
    async fetchCategories() {
      const params = this.activeUserId ? { userId: this.activeUserId } : {}
      const { data } = await Api.get('/categories', { params })
      return data?.data || []
    },
    async fetchWatchlist() {
      if (!this.activeUserId) {
        return []
      }
      const { data } = await Api.get(`/users/${this.activeUserId}/watchlists`)
      return data?.data?.watchlist || []
    },
    combineCategoriesWithMarkets(categories, markets) {
      const fallbackKey = 'uncategorized'
      const grouped = new Map()

      if (!categories.length) {
        grouped.set(fallbackKey, {
          _id: fallbackKey,
          name: 'Uncategorized',
          markets: []
        })
      } else {
        categories.forEach((category) => {
          grouped.set(category._id, { ...category, markets: [] })
        })
      }

      markets.forEach((market) => {
        const rawCategoryId = market.categoryId || fallbackKey
        const categoryId =
          typeof rawCategoryId === 'object' && rawCategoryId !== null
            ? rawCategoryId?._id || rawCategoryId?.$oid || fallbackKey
            : rawCategoryId

        if (!grouped.has(categoryId)) {
          grouped.set(categoryId, {
            _id: categoryId,
            name:
              categoryId === fallbackKey
                ? 'Uncategorized'
                : 'Unassigned category',
            markets: []
          })
        }

        grouped.get(categoryId).markets.push(market)
      })

      return Array.from(grouped.values())
    },
    async handleCreateCategory() {
      const name = window.prompt('Name your new category')
      if (!name) {
        return
      }
      this.creatingCategory = true
      try {
        const trimmedName = name.trim()
        if (!trimmedName) {
          return
        }
        const payload = {
          name: trimmedName,
          userId: this.activeUserId || null
        }
        const { data } = await Api.post('/categories', payload)
        const category = data?.data
        this.categories = [
          ...this.categories,
          {
            ...category,
            markets: []
          }
        ]
      } catch (err) {
        console.error('Failed to create category', err)
        this.categoryError =
          err?.response?.data?.error || 'Unable to create category right now.'
      } finally {
        this.creatingCategory = false
      }
    },
    async handleAssignCategory({ marketId, fromCategoryId, categoryId }) {
      try {
        await Api.patch(`/markets/${marketId}`, {
          categoryId: categoryId || null
        })
        this.categories = this.moveMarketLocally(
          marketId,
          fromCategoryId,
          categoryId || 'uncategorized'
        )
      } catch (err) {
        console.error('Failed to update market category', err)
        this.categoryError =
          err?.response?.data?.error ||
          'Unable to update market category right now.'
        await this.loadData()
      }
    },
    removeMarketLocally(marketId) {
      return this.categories.map((category) => ({
        ...category,
        markets: category.markets.filter((market) => market._id !== marketId)
      }))
    },
    async handleRemoveMarket(marketId) {
      if (!this.activeUserId) {
        return
      }

      this.removingMarkets[marketId] = true
      this.categoryError = ''
      try {
        await Api.delete(`/users/${this.activeUserId}/watchlists/${marketId}`)
        this.categories = this.removeMarketLocally(marketId)
      } catch (err) {
        console.error('Failed to remove market from watchlist', err)
        this.categoryError =
          err?.response?.data?.error ||
          err.message ||
          'Unable to remove market right now.'
        await this.loadData()
      } finally {
        this.removingMarkets[marketId] = false
      }
    },
    moveMarketLocally(marketId, fromCategoryId, targetCategoryId) {
      const clonedCategories = this.categories.map((category) => ({
        ...category,
        markets: category.markets.map((market) => ({ ...market }))
      }))

      let movedMarket = null
      clonedCategories.forEach((category) => {
        if (category._id === fromCategoryId) {
          const idx = category.markets.findIndex(
            (market) => market._id === marketId
          )
          if (idx !== -1) {
            movedMarket = {
              ...category.markets[idx],
              categoryId:
                targetCategoryId === 'uncategorized' ? null : targetCategoryId
            }
            category.markets.splice(idx, 1)
          }
        }
      })

      const normalizedTargetId = targetCategoryId || 'uncategorized'
      let targetCategory = clonedCategories.find(
        (category) => category._id === normalizedTargetId
      )
      if (!targetCategory) {
        targetCategory = {
          _id: normalizedTargetId,
          name:
            normalizedTargetId === 'uncategorized'
              ? 'Uncategorized'
              : 'Unassigned category',
          markets: []
        }
        clonedCategories.push(targetCategory)
      }

      if (movedMarket) {
        targetCategory.markets.unshift(movedMarket)
      }

      return clonedCategories
    }
  }
}
</script>

<style scoped>
.watchlist-view {
  min-height: calc(100vh - 4rem);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  max-width: 420px;
  margin: 0 auto;
}
</style>
