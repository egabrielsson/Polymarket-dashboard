<template>
  <!-- generic card for a single market pulled from the backend -->
  <div class="card market-card shadow-sm h-100">
    <div class="card-body">
      <div class="d-flex align-items-center mb-3 gap-3">
        <!-- polymarket gives us an image for most markets, this block renders it if it exists -->
        <img
          v-if="market.image"
          :src="market.image"
          :alt="`${market.title} artwork`"
          class="market-logo"
        />
        <!-- title/question shown prominently -->
        <h3 class="card-title h5 mb-0">{{ market.title }}</h3>
      </div>
      <!-- formatting helpers keep this template short -->
      <p class="mb-2">Closes: {{ formattedEndDate }}</p>
      <p class="fw-semibold mb-3">24h Volume: {{ formattedVolume }}</p>
      <ul class="list-group list-group-flush">
        <!-- outcomes chips, so we can show Yes/No -->
        <li
          v-for="outcome in market.outcomes"
          :key="outcome.label"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <span
            class="outcome-chip"
            :class="{
              'chip-yes': outcome.label.toLowerCase().includes('yes'),
              'chip-no': outcome.label.toLowerCase().includes('no')
            }"
          >
            {{ outcome.label }}
          </span>
          <span class="fw-semibold">{{
            formatOutcomePrice(outcome.price)
          }}</span>
        </li>
      </ul>
    </div>
    <div class="market-card-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarketCard',
  props: {
    market: {
      type: Object,
      required: true // expecting the normalized market shape
    }
  },
  computed: {
    formattedEndDate() {
      if (!this.market.endDate) return 'TBD'
      const date = new Date(this.market.endDate)
      if (Number.isNaN(date.getTime())) return this.market.endDate
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    },
    formattedVolume() {
      const amount = Number(this.market.volume)
      if (!Number.isFinite(amount)) return 'Not available'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(amount)
    }
  },
  methods: {
    formatOutcomePrice(value) {
      const num = Number(value)
      if (!Number.isFinite(num)) return '—'
      return `${(num * 100).toFixed(1)}%`
    }
  }
}
</script>

<style scoped>
.market-card {
  min-width: 260px;
}

.market-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.outcome-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 1.25rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
}

.chip-yes {
  background-color: #198754;
}

.chip-no {
  background-color: #dc3545;
}
.market-card-actions {
  padding: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: stretch;
  gap: 0;
  flex-wrap: wrap;
}

.market-card-actions :deep(.btn) {
  width: 100%;
  border-radius: 0 0 0.375rem 0.375rem;
}
</style>
