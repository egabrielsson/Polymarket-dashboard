const mongoose = require("mongoose")
const { Schema } = mongoose

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    marketId: {
      type: Schema.Types.ObjectId,
      ref: "Market",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    timestamp: {
      // optional domain timestamp for the note
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Ensure a user can only have one note per market
NoteSchema.index({ userId: 1, marketId: 1 }, { unique: true })

module.exports = mongoose.model("Note", NoteSchema)
