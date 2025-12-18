<template>
  <div class="market-notes">
    <b-button
      variant="primary"
      size="sm"
      @click="showModal = true"
      :disabled="loadingNotes && !notes.length"
    >
      Notes
      <span v-if="notes.length">({{ notes.length }})</span>
    </b-button>

    <b-modal
      v-model="showModal"
      :title="modalTitle"
      size="lg"
      scrollable
      @hide="resetErrors"
    >
      <div v-if="loadingNotes" class="text-center py-4">Loading...</div>

      <div v-else>
        <div v-if="loadError" class="alert alert-danger mb-3">
          {{ loadError }}
        </div>

        <div v-else>
          <ul v-if="notes.length" class="list-group mb-3">
            <li
              v-for="note in notes"
              :key="note._id || note.id"
              class="list-group-item"
            >
              <div class="small mb-1">
                {{ formatDate(note.createdAt || note.timestamp) }}
              </div>
              <p class="mb-0 text-break">{{ note.content }}</p>
            </li>
          </ul>
          <p v-else class="mb-3">No notes for this market yet.</p>
        </div>

        <form class="note-form" @submit.prevent="submitNote">
          <b-form-textarea
            v-model="noteContent"
            :disabled="!activeUserId || savingNote"
            placeholder="What do you think?"
            rows="3"
            maxlength="100"
          />

          <div
            class="d-flex flex-column flex-sm-row gap-2 align-items-sm-center mt-2"
          >
            <small> {{ noteContent.length }}/100 characters </small>
            <div class="d-flex gap-2 ms-sm-auto">
              <b-button
                variant="outline-secondary"
                size="sm"
                @click="closeModal"
              >
                Close
              </b-button>
              <b-button
                type="submit"
                variant="primary"
                size="sm"
                :disabled="!canSubmit || savingNote"
              >
                Save
              </b-button>
            </div>
          </div>
          <div v-if="saveError" class="text-danger small mt-2">
            {{ saveError }}
          </div>
          <div v-if="!activeUserId" class="small mt-2">
            Log in to save notes for this market.
          </div>
        </form>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { Api } from '@/Api'
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

export default {
  name: 'MarketNotesModal',
  props: {
    marketId: {
      type: [String, Object],
      required: true
    },
    marketTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showModal: false,
      notes: [],
      loadingNotes: false,
      loadError: '',
      noteContent: '',
      savingNote: false,
      saveError: '',
      currentMarketId: null,
      userNote: null
    }
  },
  computed: {
    activeUserId() {
      return sessionStore.session.user?.id || null
    },
    modalTitle() {
      return this.marketTitle ? `Notes · ${this.marketTitle}` : 'Market notes'
    },
    canSubmit() {
      return Boolean(this.noteContent.trim()) && Boolean(this.activeUserId)
    }
  },
  watch: {
    showModal(newValue) {
      if (newValue) {
        this.loadNotes()
      }
    },
    activeUserId(newId) {
      if (this.showModal) {
        this.loadNotes()
      }
    }
  },
  methods: {
    resolveMarketId() {
      if (typeof this.marketId === 'object') {
        return this.marketId._id || this.marketId.$oid || null
      }
      return this.marketId
    },
    async loadNotes() {
      this.loadingNotes = true
      this.loadError = ''
      this.notes = []
      const resolvedId = this.resolveMarketId()
      if (!resolvedId) {
        this.loadError = 'Missing market identifier.'
        this.loadingNotes = false
        return
      }
      this.currentMarketId = resolvedId
      try {
        const { data } = await Api.get(`/markets/${resolvedId}/notes`)
        this.notes = data?.data || []
      } catch (err) {
        console.error('Failed to load notes', err)
        this.loadError =
          err?.response?.data?.error || 'Unable to load notes right now.'
      } finally {
        this.loadingNotes = false
      }
      await this.loadUserNote()
    },
    async loadUserNote() {
      if (!this.currentMarketId || !this.activeUserId) {
        this.userNote = null
        return
      }
      try {
        const { data } = await Api.get(
          `/users/${this.activeUserId}/watchlists/${this.currentMarketId}/note`
        )
        this.userNote = data?.data?.note || null
        this.noteContent = this.userNote?.content || ''
      } catch (err) {
        if (err?.response?.status === 404) {
          this.userNote = null
          this.noteContent = ''
          return
        }
        console.error('Failed to load user note', err)
      }
    },
    async submitNote() {
      if (!this.canSubmit) {
        return
      }
      const resolvedId = this.resolveMarketId()
      if (!resolvedId || !this.activeUserId) {
        this.saveError = 'Cannot save note without a valid market or account.'
        return
      }
      this.savingNote = true
      this.saveError = ''
      try {
        if (this.userNote) {
          // PUT /api/notes/:id
          await Api.put(`/notes/${this.userNote._id}`, {
            userId: this.activeUserId,
            content: this.noteContent.trim()
          })
        } else {
          await Api.post(`/markets/${resolvedId}/notes`, {
            userId: this.activeUserId,
            content: this.noteContent.trim()
          })
        }
        await this.loadNotes()
        this.noteContent = ''
      } catch (err) {
        console.error('Failed to save note', err)
        this.saveError =
          err?.response?.data?.error || 'Unable to save note right now.'
      } finally {
        this.savingNote = false
      }
    },
    closeModal() {
      this.showModal = false
    },
    resetErrors() {
      this.loadError = ''
      this.saveError = ''
    },
    formatDate(timestamp) {
      if (!timestamp) return 'Unknown'
      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime())) return 'Unknown'
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }
  }
}
</script>

<style scoped>
.market-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.note-form textarea {
  min-height: 90px;
}
</style>
