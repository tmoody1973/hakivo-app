/**
 * API Route: /api/profile/location
 * Proxies location/representative lookup requests to the user-profile service
 */

import { NextRequest, NextResponse } from 'next/server'

// For now, we'll call the Geocodio API directly from the frontend API route
// In production, this would proxy to the user-profile service
const GEOCODIO_API_KEY = process.env.GEOCODIO_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { zipCode } = await request.json()

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid zip code. Must be 5 digits.' },
        { status: 400 }
      )
    }

    if (!GEOCODIO_API_KEY) {
      return NextResponse.json(
        { error: 'Geocodio API key not configured' },
        { status: 500 }
      )
    }

    // Call Geocodio API to get congressional district
    const geocodioResponse = await fetch(
      `https://api.geocod.io/v1.7/geocode?postal_code=${zipCode}&fields=cd&api_key=${GEOCODIO_API_KEY}`
    )

    if (!geocodioResponse.ok) {
      const error = await geocodioResponse.text()
      return NextResponse.json(
        { error: `Geocodio API failed: ${error}` },
        { status: geocodioResponse.status }
      )
    }

    const geocodioData = await geocodioResponse.json()

    if (!geocodioData.results || geocodioData.results.length === 0) {
      return NextResponse.json(
        { error: 'No congressional district found for this zip code' },
        { status: 404 }
      )
    }

    const result = geocodioData.results[0]
    const congressionalDistrict = result.fields?.congressional_districts?.[0]

    if (!congressionalDistrict) {
      return NextResponse.json(
        { error: 'Congressional district data not available' },
        { status: 404 }
      )
    }

    // Extract state and district from Geocodio response
    const state = result.address_components?.state
    const district = congressionalDistrict.district_number

    if (!state) {
      return NextResponse.json(
        { error: 'State information not available' },
        { status: 404 }
      )
    }

    // Use Geocodio's built-in legislator data (already includes all representatives)
    const legislators = congressionalDistrict.current_legislators || []
    const representatives: any[] = []

    // Process each legislator from Geocodio
    for (const legislator of legislators) {
      const isHouse = legislator.type === 'representative'
      const isSenate = legislator.type === 'senator'

      if (isHouse || isSenate) {
        representatives.push({
          name: `${legislator.bio.first_name} ${legislator.bio.last_name}`,
          chamber: isHouse ? 'House' : 'Senate',
          party: legislator.bio.party || 'Unknown',
          state: state,
          district: isHouse ? district : null,
          imageUrl: legislator.bio.photo_url || null,
          bioguideId: legislator.references.bioguide_id
        })
      }
    }

    // If no representatives found, return placeholder data
    if (representatives.length === 0) {
      representatives.push(
        {
          name: `Representative for ${state}-${district}`,
          chamber: 'House',
          party: 'Unknown',
          state: state,
          district: district,
          imageUrl: null
        },
        {
          name: `Senator for ${state} (1)`,
          chamber: 'Senate',
          party: 'Unknown',
          state: state,
          district: null,
          imageUrl: null
        },
        {
          name: `Senator for ${state} (2)`,
          chamber: 'Senate',
          party: 'Unknown',
          state: state,
          district: null,
          imageUrl: null
        }
      )
    }

    return NextResponse.json({
      zipCode,
      state,
      district,
      representatives
    })
  } catch (error) {
    console.error('Location lookup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
