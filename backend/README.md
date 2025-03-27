# Cungoland Backend

This is the backend server for the Cungoland application.

## Environment Setup

The application uses environment variables for configuration. These are stored in a `.env` file at the root of the backend directory.

1. Copy the `.env.example` file to a new file called `.env`:

   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in the correct values:
   - `NODE_ENV`: Set to "development" for local development or "production" for production deployment
   - `PORT`: The port on which the server will run
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary credentials
   - `SESSION_SECRET`: A strong secret for session encryption

## Installation

1. Install dependencies:

   ```
   npm install
   ```

2. Start the server:
   ```
   node index.mjs
   ```

## Security Notes

- The `.env` file contains sensitive information and should never be committed to version control
- In production, make sure to use strong, unique secrets and passwords
- Regularly rotate API keys and secrets for better security
