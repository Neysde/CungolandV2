import express from "express";
import { isAuthenticated } from "../middlewares.mjs";
import { CurrencyRate } from "../mongoose/schemas/currencyRate.mjs";

const router = express.Router();

/**
 * Get formatted currency rates for charts
 * GET /api/currency/rates/chart
 */
router.get("/rates/chart", async (req, res) => {
  try {
    // Get query parameters
    const limit = parseInt(req.query.limit) || 14; // Default to last 14 days
    const baseCurrency = req.query.base || "CF";

    // Fetch currency rates
    const currencyRates = await CurrencyRate.find({ baseCurrency })
      .sort({ date: 1 })
      .limit(limit);

    // Format the data for the chart
    const formattedData = {
      dates: currencyRates.map((rate) => rate.date),
      usdRates: currencyRates.map((rate) => rate.rates.USD),
      eurRates: currencyRates.map((rate) => rate.rates.EUR),
      gbpRates: currencyRates.map((rate) => rate.rates.GBP),
      tryRates: currencyRates.map((rate) => rate.rates.TRY),
    };

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Chart Data Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chart data",
      error: error.message,
    });
  }
});

/**
 * Get all currency rates (accessible without authentication)
 * GET /api/currency/rates
 */
router.get("/rates", async (req, res) => {
  try {
    // Fetch all currency rates
    const currencyRates = await CurrencyRate.find()
      .sort({ date: 1 }) // Sort by date ascending
      .limit(30); // Limit to most recent 30 entries

    if (!currencyRates.length) {
      return res.status(200).json({
        success: true,
        message: "No currency rates found",
        raw: [],
        data: {
          dates: [],
          usdRates: [],
          eurRates: [],
          gbpRates: [],
          tryRates: [],
        },
      });
    }

    // Format data for charts
    const chartData = {
      dates: currencyRates.map((rate) => rate.date),
      usdRates: currencyRates.map((rate) => rate.rates.USD || null),
      eurRates: currencyRates.map((rate) => rate.rates.EUR || null),
      gbpRates: currencyRates.map((rate) => rate.rates.GBP || null),
      tryRates: currencyRates.map((rate) => rate.rates.TRY || null),
    };

    res.status(200).json({
      success: true,
      raw: currencyRates,
      data: chartData,
    });
  } catch (error) {
    console.error("Currency Rates Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching currency rates",
      error: error.message,
    });
  }
});

/**
 * Get a single currency rate by ID
 * GET /api/currency/rates/:id
 */
router.get("/rates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Currency rate ID is required",
      });
    }

    // Find the currency rate by ID
    const currencyRate = await CurrencyRate.findById(id);

    if (!currencyRate) {
      return res.status(404).json({
        success: false,
        message: "Currency rate not found",
      });
    }

    res.status(200).json({
      success: true,
      data: currencyRate,
    });
  } catch (error) {
    console.error("Currency Rate Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching currency rate",
      error: error.message,
    });
  }
});

/**
 * Add a new currency rate (requires authentication)
 * POST /api/currency/rates
 */
router.post("/rates", isAuthenticated, async (req, res) => {
  try {
    const { date, rates } = req.body;

    // Validate required fields
    if (!date || !rates) {
      return res.status(400).json({
        success: false,
        message: "Date and at least one rate are required",
      });
    }

    // Check if a record for this date already exists
    const existingRate = await CurrencyRate.findOne({
      date: new Date(date),
      baseCurrency: "CF",
    });

    if (existingRate) {
      // Update existing record
      existingRate.rates = {
        ...existingRate.rates,
        ...rates,
      };
      existingRate.lastModified = new Date();

      await existingRate.save();

      return res.status(200).json({
        success: true,
        message: "Currency rates updated successfully",
        data: existingRate,
      });
    }

    // Create new record
    const newCurrencyRate = new CurrencyRate({
      date: new Date(date),
      baseCurrency: "CF",
      rates,
      createdBy: req.session?.userId,
      createdAt: new Date(),
      lastModified: new Date(),
    });

    await newCurrencyRate.save();

    res.status(201).json({
      success: true,
      message: "Currency rates added successfully",
      data: newCurrencyRate,
    });
  } catch (error) {
    console.error("Currency Rate Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding currency rates",
      error: error.message,
    });
  }
});

/**
 * Update a currency rate (requires authentication)
 * PUT /api/currency/rates/:id
 */
router.put("/rates/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, rates } = req.body;

    // Validate required fields
    if (!rates) {
      return res.status(400).json({
        success: false,
        message: "At least one rate is required",
      });
    }

    // Find and update the currency rate
    const currencyRate = await CurrencyRate.findById(id);

    if (!currencyRate) {
      return res.status(404).json({
        success: false,
        message: "Currency rate not found",
      });
    }

    // Update fields
    if (date) {
      currencyRate.date = new Date(date);
    }

    currencyRate.rates = {
      ...currencyRate.rates,
      ...rates,
    };

    currencyRate.lastModified = new Date();

    await currencyRate.save();

    res.status(200).json({
      success: true,
      message: "Currency rate updated successfully",
      data: currencyRate,
    });
  } catch (error) {
    console.error("Currency Rate Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating currency rate",
      error: error.message,
    });
  }
});

/**
 * Delete a currency rate (requires authentication)
 * DELETE /api/currency/rates/:id
 */
router.delete("/rates/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the currency rate
    const result = await CurrencyRate.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Currency rate not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Currency rate deleted successfully",
    });
  } catch (error) {
    console.error("Currency Rate Deletion Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting currency rate",
      error: error.message,
    });
  }
});

export default router;
