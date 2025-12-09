<template>
  <b-container fluid class="py-4">
    <div
      class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-4"
    >
      <div>
        <h1 class="display-6 fw-semibold mb-0">Browse Markets</h1>
        <p class="mb-0">Live markets fetched from Polymarket</p>
      </div>
      <div class="d-flex gap-2">
        <b-button
          variant="outline-primary"
          @click="fetchMarkets"
          :disabled="loading"
        >
          Refresh
        </b-button>
      </div>
    </div>

    <b-form class="mb-4" @submit.prevent="applySearch">
      <b-row class="g-3">
        <b-col cols="12" md="6" lg="4">
          <b-form-group label="Search">
            <b-form-input v-model="searchTerm" placeholder="" />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3" lg="2" class="d-flex align-items-end">
          <b-button
            type="submit"
            variant="primary"
            class="w-100"
            :disabled="loading"
          >
            Apply
          </b-button>
        </b-col>
        <b-col cols="12" md="3" lg="2" class="d-flex align-items-end">
          <b-button
            type="button"
            variant="outline-primary"
            class="w-100"
            @click="clearSearch"
            :disabled="loading"
          >
            Clear
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <div v-else-if="filteredMarkets.length === 0" class="text-center py-5">
      <p class="mb-0">
        <span v-if="activeSearchTerm && activeSearchTerm.trim()">
          No markets found matching "{{ activeSearchTerm }}"
        </span>
        <span v-else>No markets available</span>
      </p>
    </div>
    <div v-else>
      <b-row class="g-4 mb-4">
        <b-col
          v-for="market in displayedMarkets"
          :key="market.id"
          cols="12"
          md="6"
          lg="4"
          xl="3"
        >
          <MarketCard :market="market">
            <template #actions>
              <b-button
                variant="primary"
                size="sm"
                class="w-100"
                @click="addToWatchlist(market)"
                :disabled="addingToWatchlist[market.id] || !activeUserId"
              >
                Add to Watchlist
              </b-button>
            </template>
          </MarketCard>
        </b-col>
      </b-row>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          Page {{ currentPage }} of {{ totalPages }}
          <span v-if="filteredMarkets.length > 0">
            ({{ (currentPage - 1) * marketsPerPage + 1 }}-{{
              Math.min(currentPage * marketsPerPage, filteredMarkets.length)
            }}
            of {{ filteredMarkets.length }})
          </span>
        </div>
        <div class="d-flex gap-2">
          <b-button
            variant="outline-secondary"
            @click="previousPage"
            :disabled="currentPage === 1 || loading"
          >
            Previous
          </b-button>
          <b-button
            variant="primary"
            @click="nextPage"
            :disabled="currentPage >= totalPages || loading"
          >
            Next
          </b-button>
        </div>
      </div>
    </div>
  </b-container>
</template>

<script>
import MarketCard from '@/components/MarketCard.vue'
import { Api } from '@/Api'
import { normalizePolymarketMarket } from '@/utils/marketNormalizer'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

export default {
  name: 'BrowseMarkets',
  components: {
    MarketCard
  },
  data() {
    return {
      allMarkets: [], // All fetched markets
      loading: false,
      error: '',
      searchTerm: '', // Current input value
      activeSearchTerm: '', // Search term used for filtering (only updates on Apply)
      addingToWatchlist: {},
      currentPage: 1,
      marketsPerPage: 12,
      presetLimit: 50 // Preset limit for fetching
    }
  },
  computed: {
    activeUserId() {
      return sessionStore.session.user?.id || null
    },
    filteredMarkets() {
      // Filter markets based on active search term
      if (!this.activeSearchTerm || !this.activeSearchTerm.trim()) {
        return this.allMarkets
      }
      const searchLower = this.activeSearchTerm.toLowerCase().trim()
      return this.allMarkets.filter((market) => {
        const title = (market.title || '').toLowerCase()
        return title.includes(searchLower)
      })
    },
    displayedMarkets() {
      // Get markets for current page
      const start = (this.currentPage - 1) * this.marketsPerPage
      const end = start + this.marketsPerPage
      return this.filteredMarkets.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredMarkets.length / this.marketsPerPage)
    }
  },
  mounted() {
    this.fetchMarkets()
  },
  methods: {
    async fetchMarkets() {
      this.loading = true
      this.error = ''
      try {
        const params = {
          limit: this.presetLimit
        }
        const { data } = await Api.get('/polymarkets/tech-markets', { params })
        const marketsPayload = data?.data?.markets || []
        this.allMarkets = marketsPayload.map(normalizePolymarketMarket)
        this.currentPage = 1 // Reset to first page when fetching new markets
      } catch (err) {
        console.error('Failed to load markets', err)
        this.error = 'Unable to load markets right now.'
      } finally {
        this.loading = false
      }
    },

    async addToWatchlist(market) {
      if (!this.activeUserId) {
        this.$router.push({ name: 'login' })
        return
      }

      this.addingToWatchlist[market.id] = true
      try {
        let savedMarketId = null

        try {
          const { data: marketData } = await Api.post('/markets', {
            polymarketId: market.id,
            categoryId: null
          })
          savedMarketId = marketData?.data?._id
        } catch (marketErr) {
          if (marketErr?.response?.status === 409) {
            const { data } = await Api.get('/markets')
            const markets = data?.data || []
            const existingMarket = markets.find(
              (m) => m.polymarketId === market.id
            )
            if (existingMarket) {
              savedMarketId = existingMarket._id
            } else {
              throw new Error('Market exists but could not be found')
            }
          } else {
            throw marketErr
          }
        }

        await Api.post(`/users/${this.activeUserId}/watchlists`, {
          marketId: savedMarketId
        })
      } catch (err) {
        console.error('Failed to add to watchlist', err)
      } finally {
        this.addingToWatchlist[market.id] = false
      }
    },
    applySearch() {
      // Apply the search term to active filter
      this.activeSearchTerm = this.searchTerm
      this.currentPage = 1 // Reset to first page when searching
    },
    clearSearch() {
      this.searchTerm = ''
      this.activeSearchTerm = ''
      this.currentPage = 1 // Reset to first page when clearing search
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    }
  }
}
</script>
