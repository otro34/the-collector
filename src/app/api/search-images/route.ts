import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_API_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    return NextResponse.json({ error: 'Google API credentials not configured' }, { status: 500 })
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&num=10`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract relevant image information
    const images =
      data.items?.map((item: any) => ({
        url: item.link,
        thumbnail: item.image?.thumbnailLink,
        title: item.title,
        width: item.image?.width,
        height: item.image?.height,
      })) || []

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images from Google' }, { status: 500 })
  }
}
