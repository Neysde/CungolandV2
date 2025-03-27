/**
 * currency-charts.js - Currency Exchange Rate Charts
 * Manages the currency exchange rate charts on the main page
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize currency charts
  initCurrencyCharts();
});

/**
 * Initialize currency charts with data from the API
 */
async function initCurrencyCharts() {
  try {
    // Fetch currency rates
    const response = await fetch("/api/currency/rates");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the data has the expected format
    if (!data.success) {
      throw new Error("Failed to fetch currency rates");
    }

    console.log("API Response:", data); // Log the API response for debugging

    // Check if the data structure is as expected
    if (!data.data || !data.data.dates || !Array.isArray(data.data.dates)) {
      // If data.data.dates doesn't exist, use raw data to create formatted chart data
      if (data.raw && Array.isArray(data.raw) && data.raw.length > 0) {
        console.log("Using raw data format");

        // Sort rates by date
        const sortedRates = [...data.raw].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        // Extract dates and rates
        const chartData = {
          dates: sortedRates.map((rate) => rate.date),
          usdRates: sortedRates.map((rate) => rate.rates.USD || null),
          eurRates: sortedRates.map((rate) => rate.rates.EUR || null),
          gbpRates: sortedRates.map((rate) => rate.rates.GBP || null),
          tryRates: sortedRates.map((rate) => rate.rates.TRY || null),
        };

        // Format dates for display
        const formattedDates = chartData.dates.map((date) => {
          const d = new Date(date);
          return `${d.getDate().toString().padStart(2, "0")}.${(
            d.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}`;
        });

        // Initialize charts with the reformatted data
        if (formattedDates.length > 0) {
          initForeignCurrencyChart(formattedDates, chartData);
          initTryChart(formattedDates, chartData);
        } else {
          displayNoDataMessage();
        }
      } else {
        throw new Error("Invalid data format received from API");
      }
    } else {
      // Use the existing data format
      console.log("Using standard data format");

      // Format dates for display
      const formattedDates = data.data.dates.map((date) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
      });

      // Check if we have data to display
      if (formattedDates.length > 0) {
        // Initialize the foreign currency chart (USD, EUR, GBP)
        initForeignCurrencyChart(formattedDates, data.data);

        // Initialize the TRY chart
        initTryChart(formattedDates, data.data);
      } else {
        // No data available
        displayNoDataMessage();
      }
    }
  } catch (error) {
    console.error("Error initializing currency charts:", error);
    displayErrorMessage(error.message);
  }
}

/**
 * Initialize the foreign currency chart
 * @param {Array} dates - Formatted dates for x-axis
 * @param {Object} data - Currency rate data
 */
function initForeignCurrencyChart(dates, data) {
  const ctx = document.getElementById("foreignCurrencyChart");

  if (!ctx) return;

  try {
    // Destroy previous chart if it exists
    if (window.foreignCurrencyChart instanceof Chart) {
      window.foreignCurrencyChart.destroy();
    }

    // Create new chart
    window.foreignCurrencyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "USD/CF",
            data: data.usdRates,
            borderColor: "#f39c12",
            backgroundColor: "rgba(243, 156, 18, 0.1)",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "EUR/CF",
            data: data.eurRates,
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "GBP/CF",
            data: data.gbpRates,
            borderColor: "#2ecc71",
            backgroundColor: "rgba(46, 204, 113, 0.1)",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: "circle",
              padding: 10,
              font: {
                size: 10,
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 9,
              },
              maxRotation: 0,
            },
          },
          y: {
            position: "right",
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              color: "#666",
              font: {
                size: 9,
              },
              callback: function (value) {
                return value.toFixed(2);
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating foreign currency chart:", error);
    displayErrorMessage("Failed to create chart: " + error.message);
  }
}

/**
 * Initialize the TRY chart
 * @param {Array} dates - Formatted dates for x-axis
 * @param {Object} data - Currency rate data
 */
function initTryChart(dates, data) {
  const ctx = document.getElementById("tryChart");

  if (!ctx) return;

  try {
    // Destroy previous chart if it exists
    if (window.tryChart instanceof Chart) {
      window.tryChart.destroy();
    }

    // Create new chart
    window.tryChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "CF/TRY",
            data: data.tryRates,
            borderColor: "#e74c3c",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 3,
            pointHoverRadius: 5,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: "circle",
              padding: 10,
              font: {
                size: 10,
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 9,
              },
              maxRotation: 0,
            },
          },
          y: {
            position: "right",
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              color: "#666",
              font: {
                size: 9,
              },
              callback: function (value) {
                return value.toFixed(2);
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating TRY chart:", error);
    displayErrorMessage("Failed to create chart: " + error.message);
  }
}

/**
 * Display a message when no data is available
 */
function displayNoDataMessage() {
  const chartContainers = document.querySelectorAll(".currency-chart");
  chartContainers.forEach((container) => {
    container.innerHTML = `
      <div class="no-data-message" style="text-align: center; padding: 2rem 0;">
        <i class="fas fa-chart-line" style="font-size: 2rem; color: #ccc; display: block; margin-bottom: 1rem;"></i>
        <p style="color: #666;">No currency rate data available</p>
      </div>
    `;
  });
}

/**
 * Display an error message when chart data loading fails
 * @param {string} errorMessage - The error message to display
 */
function displayErrorMessage(errorMessage) {
  const chartContainers = document.querySelectorAll(".currency-chart");
  chartContainers.forEach((container) => {
    container.innerHTML = `
      <div class="error-message" style="text-align: center; padding: 2rem 0;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c; display: block; margin-bottom: 1rem;"></i>
        <p style="color: #666;">Error loading charts: ${errorMessage}</p>
      </div>
    `;
  });
}
