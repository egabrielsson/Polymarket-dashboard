<template>
  <b-container fluid class="py-4 watchlist-view">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1 class="display-6 fw-semibold mb-0">Watchlist</h1>
        <p class="mb-0">Organize your saved markets by category</p>
      </div>
    </div>

    <div class="mb-3 d-flex flex-column gap-2">
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <b-button
          variant="outline-primary"
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
          Create Category
        </b-button>
        <div class="d-flex align-items-center gap-2 ms-auto">
          <label for="sort-select" class="mb-0 small text-muted">Sort by:</label>
          <b-form-select
            id="sort-select"
            v-model="sortOrder"
            :options="sortOptions"
            size="sm"
            class="w-auto"
          />
        </div>
      </div>
      <div v-if="isAdminUser" class="d-flex flex-wrap gap-2 align-items-center">
        <b-button
          variant="outline-danger"
          class="border-2"
          :disabled="deletingCollection"
          @click="handleDeleteMarketsCollection"
        >
          Delete markets collection
        </b-button>
      </div>
      <b-alert v-if="adminSuccess" variant="success" show class="mb-0">
        {{ adminSuccess }}
      </b-alert>
      <b-alert v-if="adminError" variant="danger" show class="mb-0">
        {{ adminError }}
      </b-alert>
    </div>

    <!-- Create Category Modal -->
    <b-modal
      v-model="showCreateCategoryModal"
      title="Create Category"
      size="sm"
      @hide="newCategoryName = ''"
    >
      <b-form-input
        v-model="newCategoryName"
        placeholder="Category name"
        autofocus
        @keyup.enter="confirmCreateCategory"
      />
      <template #footer>
        <b-button variant="outline-secondary" size="sm" @click="showCreateCategoryModal = false">
          Cancel
        </b-button>
        <b-button
          variant="primary"
          size="sm"
          :disabled="!newCategoryName.trim() || creatingCategory"
          @click="confirmCreateCategory"
        >
          Create
        </b-button>
      </template>
    </b-modal>

    <b-alert v-if="!activeUserId" variant="warning" show class="mb-4">
      Please log in to view your watchlist.
    </b-alert>

    <div v-if="categoryError" class="alert alert-danger" role="alert">
      {{ categoryError }}
    </div>
    <div v-else-if="loadingCategories">Loading...</div>
    <div v-else>
      <div v-if="!categories.length" class="empty-state card p-4 text-center">
        <p class="mb-1 fw-semibold">No categories yet</p>
        <p class="mb-0">
          Create your first category to start organizing markets.
        </p>
      </div>
      <div v-else class="category-grid">
        <CategoryColumn
          v-for="category in sortedCategories"
          :key="category._id"
          :category="category"
          :markets="category.markets"
          :all-categories="categoryOptions"
          :removing-markets="removingMarkets"
          :deleting-categories="deletingCategories"
          @update-category="handleAssignCategory"
          @remove-market="handleRemoveMarket"
          @delete-category="handleDeleteCategory"
        />
      </div>
    </div>
  </b-container>
</template>

<script>
import CategoryColumn from '@/components/CategoryColumn.vue'
import { Api } from '@/Api'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

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
      removingMarkets: {},
      deletingCategories: {},
      deletingCollection: false,
      adminError: '',
      adminSuccess: '',
      showCreateCategoryModal: false,
      newCategoryName: '',
      sortOrder: 'alphabetic',
      sortOptions: [
        { value: 'alphabetic', text: 'A-Z' },
        { value: 'alphabetic-desc', text: 'Z-A' },
        { value: 'markets', text: 'Most markets' },
        { value: 'markets-asc', text: 'Least markets' }
      ]
    }
  },
  computed: {
    activeUserId() {
      return sessionStore.session.user?.id || null
    },
    isAdminUser() {
      const username = sessionStore.session.user?.username || ''
      return username.toUpperCase().includes('ADMIN')
    },
    categoryOptions() {
      return this.categories.map(({ _id, name }) => ({
        _id,
        name
      }))
    },
    sortedCategories() {
      const sorted = [...this.categories]
      switch (this.sortOrder) {
        case 'alphabetic':
          return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case 'alphabetic-desc':
          return sorted.sort((a, b) => b.name.localeCompare(a.name))
        case 'markets':
          return sorted.sort((a, b) => b.markets.length - a.markets.length)
        case 'markets-asc':
          return sorted.sort((a, b) => a.markets.length - b.markets.length)
        default:
          return sorted
      }
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
        this.categories = this.combineCategoriesWithMarkets(categories, watchlist)
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
      const sanitizedMarkets = markets.filter(Boolean)
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

      sanitizedMarkets.forEach((market) => {
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
    async handleDeleteMarketsCollection() {
      this.deletingCollection = true
      this.adminError = ''
      this.adminSuccess = ''
      try {
        await Api.delete('/markets')
        this.adminSuccess = 'Markets collection deleted; refreshing data.'
        await this.loadData()
      } catch (err) {
        console.error('Failed to delete markets collection', err)
        this.adminError =
          err?.response?.data?.error ||
          err.message ||
          'Unable to delete markets collection right now.'
      } finally {
        this.deletingCollection = false
      }
    },
    handleCreateCategory() {
      this.showCreateCategoryModal = true
    },
    async confirmCreateCategory() {
      const name = this.newCategoryName.trim()
      if (!name) {
        return
      }
      this.creatingCategory = true
      try {
        const payload = {
          name,
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
        this.showCreateCategoryModal = false
        this.newCategoryName = ''
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
        // Update category in user's watchlist (not the shared market)
        await Api.patch(
          `/users/${this.activeUserId}/watchlists/${marketId}/category`,
          {
            categoryId: categoryId || null
          }
        )
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
    },
    async handleDeleteCategory(categoryId) {
      if (!this.activeUserId) {
        return
      }

      const category = this.categories.find((cat) => cat._id === categoryId)
      if (!category) {
        return
      }

      // Confirm deletion
      const confirmMessage =
        category.markets.length > 0
          ? `Delete "${category.name}"? ${category.markets.length} market(s) will be moved to Uncategorized.`
          : `Delete "${category.name}"?`

      if (!window.confirm(confirmMessage)) {
        return
      }

      this.deletingCategories[categoryId] = true
      this.categoryError = ''

      try {
        // Move all markets in this category to uncategorized (null categoryId)
        const movePromises = category.markets.map((market) =>
          Api.patch(
            `/users/${this.activeUserId}/watchlists/${market._id}/category`,
            { categoryId: null }
          )
        )
        await Promise.all(movePromises)

        // Delete the category
        await Api.delete(`/categories/${categoryId}`, {
          data: { userId: this.activeUserId }
        })

        // Reload data to refresh the view
        await this.loadData()
      } catch (err) {
        console.error('Failed to delete category', err)
        this.categoryError =
          err?.response?.data?.error ||
          err.message ||
          'Unable to delete category right now.'
        await this.loadData()
      } finally {
        this.deletingCategories[categoryId] = false
      }
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
  grid-template-columns: repeat(auto-fill, minmax(min(400px, 100%), 1fr));
  gap: 1.5rem;
}

.empty-state {
  max-width: 420px;
  margin: 0 auto;
}
</style>
