# Çüngoland Official Website

The official website for Çüngoland, featuring information about the country, news, photos, and currency exchange rates.

## Features

### CF Currency Exchange Rates

The website now displays real-time exchange rates for the Çüngoland currency (CF) against major currencies:

- USD/CF Exchange Rate
- EUR/CF Exchange Rate
- GBP/CF Exchange Rate
- CF/TRY Exchange Rate

Currency rates are displayed with interactive charts on the homepage, showing historical trends of the CF currency against major world currencies.

### Dashboard for Currency Management

Administrators can manage currency exchange rates through the dashboard:

- Add new currency rates
- Edit existing rates
- Delete rates
- View historical rate data in tabular format
- Preview rate trends in charts

### News and Updates

Stay up-to-date with the latest news and events from Çüngoland.

### Photo Gallery

Browse through a collection of photos from Çüngoland showcasing its beautiful landscapes, culture, and people.

### Çüngo Twitter

View and interact with posts from the official Çüngo Twitter feed.

### Wiki

Access information about Çüngoland, its history, culture, and more through the wiki.

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (see below)
4. Start the server:
   ```
   npm start
   ```

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

- `NODE_ENV`: "development" or "production"
- `PORT`: The port for the server to run on
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret for session encryption
- Additional configuration for Cloudinary, if using image uploads

## Testing

### Testing Currency Exchange Rate API

A test script is provided to verify the currency exchange rate API functionality:

```
node test/currency-test.js
```

This will run through a sequence of tests for the currency API endpoints, including adding, updating, deleting, and retrieving currency rates.

## Contributors

- [List of contributors]

## License

[Specify license information]
