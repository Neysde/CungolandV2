import mongoose from "mongoose";

/**
 * Currency Rate Schema
 * Stores exchange rates for the Çüngoland currency (CF) against other currencies
 */
const currencyRateSchema = new mongoose.Schema({
  // The date of the exchange rate
  date: {
    type: Date,
    required: true,
    index: true,
  },
  // Base currency code (e.g., "CF")
  baseCurrency: {
    type: String,
    required: true,
    default: "CF",
  },
  // Exchange rates against other currencies
  rates: {
    // USD rate against CF (e.g., 1.2 means 1 CF = 1.2 USD)
    USD: {
      type: Number,
      default: null,
    },
    // EUR rate against CF
    EUR: {
      type: Number,
      default: null,
    },
    // GBP rate against CF
    GBP: {
      type: Number,
      default: null,
    },
    // TRY rate against CF
    TRY: {
      type: Number,
      default: null,
    },
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index on date and baseCurrency to ensure uniqueness
currencyRateSchema.index({ date: 1, baseCurrency: 1 }, { unique: true });

// Export the CurrencyRate model
export const CurrencyRate = mongoose.model(
  "CurrencyRate",
  currencyRateSchema,
  "currencyRates"
);
