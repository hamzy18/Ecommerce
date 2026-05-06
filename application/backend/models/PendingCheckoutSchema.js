import mongoose from 'mongoose'

const PendingCheckoutSchema = new mongoose.Schema(
  {
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

PendingCheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PendingCheckout = mongoose.model('PendingCheckout', PendingCheckoutSchema)
export default PendingCheckout
