/**
 * currency-dashboard.js - Currency Exchange Rate Dashboard
 * Manages the currency exchange rate dashboard in the admin panel
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the currency dashboard
  initCurrencyDashboard();
});

/**
 * Initialize the currency dashboard
 */
async function initCurrencyDashboard() {
  // Load currency rates
  await loadCurrencyRates();

  // Initialize form
  initCurrencyForm();

  // Initialize charts
  initDashboardCharts();
}

/**
 * Initialize the currency rate form
 */
function initCurrencyForm() {
  const currencyForm = document.getElementById("currencyRateForm");
  const resetButton = document.getElementById("resetCurrencyForm");

  if (!currencyForm) return;

  // Handle form submission
  currencyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      date: document.getElementById("rateDate").value,
      rates: {},
    };

    // Add rate values if they exist
    const usdRate = document.getElementById("usdRate").value;
    const eurRate = document.getElementById("eurRate").value;
    const gbpRate = document.getElementById("gbpRate").value;
    const tryRate = document.getElementById("tryRate").value;

    if (usdRate) formData.rates.USD = parseFloat(usdRate);
    if (eurRate) formData.rates.EUR = parseFloat(eurRate);
    if (gbpRate) formData.rates.GBP = parseFloat(gbpRate);
    if (tryRate) formData.rates.TRY = parseFloat(tryRate);

    // Get ID if we're editing
    const currencyRateId = document.getElementById("currencyRateId").value;

    try {
      let response;

      if (currencyRateId) {
        // Update existing rate
        response = await fetch(`/api/currency/rates/${currencyRateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Add new rate
        response = await fetch("/api/currency/rates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();

      if (result.success) {
        // Show success message
        showMessage(
          "success",
          currencyRateId
            ? "Rate updated successfully!"
            : "Rate added successfully!"
        );

        // Reset form
        resetCurrencyForm();

        // Reload rates
        await loadCurrencyRates();

        // Reload charts
        initDashboardCharts();
      } else {
        showMessage("error", result.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving currency rate:", error);
      showMessage("error", "An error occurred while saving the rate");
    }
  });

  // Handle reset button
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetCurrencyForm();
    });
  }
}

/**
 * Reset the currency rate form
 */
function resetCurrencyForm() {
  const currencyForm = document.getElementById("currencyRateForm");

  if (!currencyForm) return;

  // Reset form values
  document.getElementById("rateDate").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("usdRate").value = "";
  document.getElementById("eurRate").value = "";
  document.getElementById("gbpRate").value = "";
  document.getElementById("tryRate").value = "";
  document.getElementById("currencyRateId").value = "";

  // Change submit button text
  const submitButton = currencyForm.querySelector(".submit-btn");
  if (submitButton) {
    submitButton.textContent = "Save Exchange Rate";
  }
}

/**
 * Load currency rates from the API and populate the table
 */
async function loadCurrencyRates() {
  const tableBody = document.getElementById("currencyRatesTableBody");

  if (!tableBody) return;

  try {
    // Fetch currency rates
    const response = await fetch("/api/currency/rates");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch currency rates");
    }

    // Clear the table
    tableBody.innerHTML = "";

    // Check if we have rates
    if (data.raw && data.raw.length > 0) {
      // Sort rates by date (newest first)
      const sortedRates = data.raw.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Populate the table
      sortedRates.forEach((rate) => {
        const row = document.createElement("tr");

        // Format date
        const date = new Date(rate.date);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}.${date.getFullYear()}`;

        row.innerHTML = `
          <td>${formattedDate}</td>
          <td>${rate.rates.USD ? rate.rates.USD.toFixed(4) : "-"}</td>
          <td>${rate.rates.EUR ? rate.rates.EUR.toFixed(4) : "-"}</td>
          <td>${rate.rates.GBP ? rate.rates.GBP.toFixed(4) : "-"}</td>
          <td>${rate.rates.TRY ? rate.rates.TRY.toFixed(4) : "-"}</td>
          <td>
            <button class="edit-btn" data-id="${rate._id}">Edit</button>
            <button class="delete-btn" data-id="${rate._id}">Delete</button>
          </td>
        `;

        tableBody.appendChild(row);
      });

      // Add event listeners to edit and delete buttons
      addTableEventListeners();
    } else {
      // No rates found
      const row = document.createElement("tr");
      row.innerHTML = `
        <td colspan="6" style="text-align: center;">No exchange rates found</td>
      `;
      tableBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error loading currency rates:", error);

    // Show error in table
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: red;">Error loading rates: ${error.message}</td>
      </tr>
    `;
  }
}

/**
 * Add event listeners to table buttons
 */
function addTableEventListeners() {
  // Edit buttons
  const editButtons = document.querySelectorAll(
    ".currency-rates-table .edit-btn"
  );
  editButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const rateId = button.getAttribute("data-id");
      await loadRateForEditing(rateId);
    });
  });

  // Delete buttons
  const deleteButtons = document.querySelectorAll(
    ".currency-rates-table .delete-btn"
  );
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const rateId = button.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this exchange rate?")) {
        await deleteRate(rateId);
      }
    });
  });
}

/**
 * Load a rate for editing
 * @param {string} rateId - The ID of the rate to edit
 */
async function loadRateForEditing(rateId) {
  try {
    // Fetch rate data
    const response = await fetch(`/api/currency/rates/${rateId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch rate data");
    }

    const rate = data.data;

    // Populate form
    document.getElementById("rateDate").value = new Date(rate.date)
      .toISOString()
      .split("T")[0];
    document.getElementById("usdRate").value = rate.rates.USD || "";
    document.getElementById("eurRate").value = rate.rates.EUR || "";
    document.getElementById("gbpRate").value = rate.rates.GBP || "";
    document.getElementById("tryRate").value = rate.rates.TRY || "";
    document.getElementById("currencyRateId").value = rate._id;

    // Change submit button text
    const submitButton = document.querySelector(
      "#currencyRateForm .submit-btn"
    );
    if (submitButton) {
      submitButton.textContent = "Update Exchange Rate";
    }

    // Scroll to form
    document
      .querySelector(".currency-form-container")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error loading rate for editing:", error);
    showMessage("error", "Error loading rate data");
  }
}

/**
 * Delete a rate
 * @param {string} rateId - The ID of the rate to delete
 */
async function deleteRate(rateId) {
  try {
    // Delete rate
    const response = await fetch(`/api/currency/rates/${rateId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      // Show success message
      showMessage("success", "Rate deleted successfully!");

      // Reload rates
      await loadCurrencyRates();

      // Reload charts
      initDashboardCharts();
    } else {
      showMessage("error", result.message || "An error occurred");
    }
  } catch (error) {
    console.error("Error deleting rate:", error);
    showMessage("error", "An error occurred while deleting the rate");
  }
}

/**
 * Initialize dashboard charts
 */
async function initDashboardCharts() {
  try {
    // Fetch currency rates
    const response = await fetch("/api/currency/rates");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch currency rates");
    }

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
      initDashboardForeignCurrencyChart(formattedDates, data.data);

      // Initialize the TRY chart
      initDashboardTryChart(formattedDates, data.data);
    } else {
      // No data available
      const chartContainers = document.querySelectorAll(".currency-chart");
      chartContainers.forEach((container) => {
        container.innerHTML = `
          <div class="no-data-message">
            <i class="fas fa-chart-line"></i>
            <p>No currency rate data available</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error("Error initializing dashboard charts:", error);

    // Show error in chart containers
    const chartContainers = document.querySelectorAll(".currency-chart");
    chartContainers.forEach((container) => {
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error loading charts: ${error.message}</p>
        </div>
      `;
    });
  }
}

/**
 * Initialize dashboard foreign currency chart
 * @param {Array} dates - Formatted dates for x-axis
 * @param {Object} data - Currency rate data
 */
function initDashboardForeignCurrencyChart(dates, data) {
  const ctx = document.getElementById("dashboardForeignCurrencyChart");

  if (!ctx) return;

  // Check if a chart instance already exists
  if (window.foreignCurrencyChart) {
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
          tension: 0.1,
          pointRadius: 3,
        },
        {
          label: "EUR/CF",
          data: data.eurRates,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 3,
        },
        {
          label: "GBP/CF",
          data: data.gbpRates,
          borderColor: "#2ecc71",
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        y: {
          beginAtZero: false,
          position: "right",
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            // Format the ticks to 2 decimal places
            callback: function (value) {
              return value.toFixed(2);
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(4);
              }
              return label;
            },
          },
        },
      },
    },
  });
}

/**
 * Initialize dashboard TRY chart
 * @param {Array} dates - Formatted dates for x-axis
 * @param {Object} data - Currency rate data
 */
function initDashboardTryChart(dates, data) {
  const ctx = document.getElementById("dashboardTryChart");

  if (!ctx) return;

  // Check if a chart instance already exists
  if (window.tryChart) {
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
          tension: 0.1,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        y: {
          beginAtZero: false,
          position: "right",
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            // Format the ticks to 2 decimal places
            callback: function (value) {
              return value.toFixed(2);
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(4);
              }
              return label;
            },
          },
        },
      },
    },
  });
}

/**
 * Show a message to the user
 * @param {string} type - The type of message ('success' or 'error')
 * @param {string} message - The message to display
 */
function showMessage(type, message) {
  // Create message element
  const messageElement = document.createElement("div");
  messageElement.className = `alert alert-${type}`;
  messageElement.textContent = message;

  // Get alert container or create one
  let alertContainer = document.querySelector(
    ".currency-form-container .alert-container"
  );

  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.className = "alert-container";
    document.querySelector(".currency-form-container").prepend(alertContainer);
  }

  // Add message to container
  alertContainer.innerHTML = "";
  alertContainer.appendChild(messageElement);

  // Remove message after 3 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 3000);
}
