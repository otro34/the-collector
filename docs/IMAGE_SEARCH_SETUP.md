# Google Image Search Setup

This document explains how to set up the Google Image Search functionality for replacing cover images in The Collector application.

## Overview

The application includes a feature that allows users to search Google Images and replace cover images for items in their collection. When viewing an item's details, users can click "Change Cover Image" to open a search dialog, find suitable images, and save them to the item.

## Prerequisites

To use this feature, you need:

1. A Google Cloud Platform account
2. A Google Custom Search API key
3. A Google Programmable Search Engine ID

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project (required for API access)

### 2. Enable Custom Search API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Custom Search API"
3. Click on it and press **Enable**

### 3. Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key
4. (Optional) Restrict the API key to only the Custom Search API for security

### 4. Create a Programmable Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **Add** to create a new search engine
3. Configure the search engine:
   - **Sites to search**: Select "Search the entire web"
   - **Name**: Give it a descriptive name (e.g., "The Collector Image Search")
4. Click **Create**
5. In the search engine settings:
   - Go to **Setup** > **Basic**
   - Enable **Image search**
   - Copy the **Search engine ID**

### 5. Configure Environment Variables

Add the following variables to your `.env` file:

```env
GOOGLE_API_KEY="your-api-key-here"
GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id-here"
```

Replace the placeholder values with your actual API key and Search Engine ID.

## Usage

1. Open any item's detail view by clicking on it
2. Click the **Change Cover Image** button below the cover image
3. Enter a search query (defaults to the item's title)
4. Click the search button or press Enter
5. Select an image from the results grid
6. Click **Use Selected Image** to save the new cover image

The cover image will be updated immediately and the modal will refresh to show the new image.

## API Quotas and Limits

- The Google Custom Search API has a free tier of 100 queries per day
- After that, you'll be charged per 1,000 queries
- Each image search counts as one query
- Check current pricing at: https://developers.google.com/custom-search/v1/overview#pricing

## Troubleshooting

### "Google API credentials not configured" error

- Ensure both `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set in your `.env` file
- Restart your development server after adding the environment variables

### "Failed to search images" error

- Check that the Custom Search API is enabled in your Google Cloud project
- Verify your API key is valid and not restricted from accessing the Custom Search API
- Ensure you haven't exceeded your daily quota

### Images not loading

- Check that the search engine has "Image search" enabled
- Verify the Search Engine ID is correct
- Some images may fail to load due to CORS restrictions or broken links

## Technical Details

### API Endpoint

**GET** `/api/search-images?query={search_term}`

Returns a JSON response with image results:

```json
{
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "thumbnail": "https://example.com/thumb.jpg",
      "title": "Image title",
      "width": 800,
      "height": 1200
    }
  ]
}
```

### Components

- **ImageSearchDialog**: Modal component for searching and selecting images
- **ItemDetailModal**: Updated to include the "Change Cover Image" button
- **API Route**: `/src/app/api/search-images/route.ts` handles Google API requests
- **PATCH Endpoint**: `/src/app/api/items/[id]/route.ts` handles cover image updates

## Security Considerations

1. **API Key Security**: Never commit your `.env` file to version control
2. **API Restrictions**: Consider restricting your API key to:
   - Only the Custom Search API
   - Specific referrer URLs (your domain)
   - IP address restrictions if applicable
3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
4. **Image Validation**: The system validates that the coverUrl is a valid URL before saving
