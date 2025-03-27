/**
 * Test script for currency exchange rate API
 *
 * This file contains tests for the currency exchange rate API endpoints.
 * It tests adding, updating, deleting, and retrieving currency rates.
 */

// Import required modules
const fetch = require("node-fetch");

// Configuration
const API_BASE_URL = "http://localhost:3000/api/currency";

// Sample currency rate data
const sampleRates = [
  {
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 10 days ago
    rates: {
      USD: 0.035,
      EUR: 0.032,
      GBP: 0.027,
      TRY: 1.15,
    },
  },
  {
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 days ago
    rates: {
      USD: 0.036,
      EUR: 0.033,
      GBP: 0.028,
      TRY: 1.18,
    },
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 4 days ago
    rates: {
      USD: 0.037,
      EUR: 0.034,
      GBP: 0.029,
      TRY: 1.21,
    },
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Yesterday
    rates: {
      USD: 0.038,
      EUR: 0.035,
      GBP: 0.03,
      TRY: 1.24,
    },
  },
];

// Test functions
async function testAddRates() {
  console.log("=== Testing Add Rates ===");

  for (const rate of sampleRates) {
    try {
      const response = await fetch(`${API_BASE_URL}/rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rate),
      });

      const result = await response.json();
      console.log(
        `Added rate for ${rate.date}: ${result.success ? "SUCCESS" : "FAILED"}`
      );

      if (!result.success) {
        console.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error(`Error adding rate for ${rate.date}:`, error.message);
    }
  }
}

async function testGetAllRates() {
  console.log("\n=== Testing Get All Rates ===");

  try {
    const response = await fetch(`${API_BASE_URL}/rates`);
    const result = await response.json();

    console.log(`Get all rates: ${result.success ? "SUCCESS" : "FAILED"}`);

    if (result.success) {
      console.log(`Found ${result.raw.length} rates`);

      // Display rate data
      result.raw.forEach((rate) => {
        const date = new Date(rate.date).toISOString().split("T")[0];
        console.log(
          `- ${date}: USD=${rate.rates.USD}, EUR=${rate.rates.EUR}, GBP=${rate.rates.GBP}, TRY=${rate.rates.TRY}`
        );
      });
    } else {
      console.error(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error getting all rates:", error.message);
  }
}

async function testGetChartData() {
  console.log("\n=== Testing Get Chart Data ===");

  try {
    const response = await fetch(`${API_BASE_URL}/rates/chart`);
    const result = await response.json();

    console.log(`Get chart data: ${result.success ? "SUCCESS" : "FAILED"}`);

    if (result.success) {
      console.log(`Chart data contains ${result.data.dates.length} dates`);

      // Display first and last date
      if (result.data.dates.length > 0) {
        console.log(
          `- Date range: ${result.data.dates[0]} to ${
            result.data.dates[result.data.dates.length - 1]
          }`
        );
      }
    } else {
      console.error(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error getting chart data:", error.message);
  }
}

async function testUpdateRate() {
  console.log("\n=== Testing Update Rate ===");

  try {
    // First, get all rates to find one to update
    const response = await fetch(`${API_BASE_URL}/rates`);
    const result = await response.json();

    if (!result.success || result.raw.length === 0) {
      console.error("No rates available to update");
      return;
    }

    // Get the first rate
    const rateToUpdate = result.raw[0];
    const updatedRateData = {
      date: new Date(rateToUpdate.date).toISOString().split("T")[0],
      rates: {
        USD: rateToUpdate.rates.USD + 0.001,
        EUR: rateToUpdate.rates.EUR + 0.001,
        GBP: rateToUpdate.rates.GBP + 0.001,
        TRY: rateToUpdate.rates.TRY + 0.05,
      },
    };

    // Update the rate
    const updateResponse = await fetch(
      `${API_BASE_URL}/rates/${rateToUpdate._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRateData),
      }
    );

    const updateResult = await updateResponse.json();

    console.log(
      `Update rate for ${updatedRateData.date}: ${
        updateResult.success ? "SUCCESS" : "FAILED"
      }`
    );

    if (!updateResult.success) {
      console.error(`Error: ${updateResult.message}`);
    }
  } catch (error) {
    console.error("Error updating rate:", error.message);
  }
}

async function testDeleteRate() {
  console.log("\n=== Testing Delete Rate ===");

  try {
    // First, get all rates to find one to delete
    const response = await fetch(`${API_BASE_URL}/rates`);
    const result = await response.json();

    if (!result.success || result.raw.length === 0) {
      console.error("No rates available to delete");
      return;
    }

    // Get the last rate
    const rateToDelete = result.raw[result.raw.length - 1];

    // Delete the rate
    const deleteResponse = await fetch(
      `${API_BASE_URL}/rates/${rateToDelete._id}`,
      {
        method: "DELETE",
      }
    );

    const deleteResult = await deleteResponse.json();

    console.log(
      `Delete rate for ${
        new Date(rateToDelete.date).toISOString().split("T")[0]
      }: ${deleteResult.success ? "SUCCESS" : "FAILED"}`
    );

    if (!deleteResult.success) {
      console.error(`Error: ${deleteResult.message}`);
    }
  } catch (error) {
    console.error("Error deleting rate:", error.message);
  }
}

// Run tests
async function runTests() {
  console.log("Starting Currency API Tests...\n");

  try {
    // Test adding rates
    await testAddRates();

    // Test getting all rates
    await testGetAllRates();

    // Test getting chart data
    await testGetChartData();

    // Test updating a rate
    await testUpdateRate();

    // Test getting all rates again to verify update
    await testGetAllRates();

    // Test deleting a rate
    await testDeleteRate();

    // Test getting all rates again to verify delete
    await testGetAllRates();

    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("\nTest execution failed:", error);
  }
}

// Run the tests
runTests();
