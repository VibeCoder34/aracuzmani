import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/trims - List all trims (optionally filtered by model)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('model_id')

    // Build query
    let query = supabase
      .from('car_trims')
      .select(`
        *,
        car_models (
          id,
          name,
          car_brands (
            id,
            name
          )
        )
      `)
      .order('year', { ascending: false })

    if (modelId) {
      query = query.eq('model_id', modelId)
    }

    const { data: trims, error } = await query

    if (error) throw error

    return NextResponse.json({ trims })
  } catch (error) {
    console.error('Error fetching trims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trims' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/trims - Create a new trim
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      model_id, 
      year, 
      trim_name, 
      engine, 
      transmission, 
      drivetrain,
      // Interior design
      seat_count,
      trunk_volume,
      // Exterior design
      door_count,
      width,
      length,
      height,
      weight,
      body_type,
      // Fuel economy
      fuel_type,
      avg_consumption,
      // Performance
      max_torque,
      max_speed,
      acceleration_0_to_100,
      horsepower,
      transmission_type,
      drive_type,
      // Images
      image_urls,
    } = body

    if (!model_id || !year) {
      return NextResponse.json(
        { error: 'Model ID and year are required' },
        { status: 400 }
      )
    }

    // Insert trim
    const { data: trim, error } = await supabase
      .from('car_trims')
      .insert({
        model_id,
        year,
        trim_name,
        engine,
        transmission,
        drivetrain,
        // Interior design
        seat_count,
        trunk_volume,
        // Exterior design
        door_count,
        width,
        length,
        height,
        weight,
        body_type,
        // Fuel economy
        fuel_type,
        avg_consumption,
        // Performance
        max_torque,
        max_speed,
        acceleration_0_to_100,
        horsepower,
        transmission_type,
        drive_type,
        // Images
        image_urls,
      })
      .select(`
        *,
        car_models (
          id,
          name,
          car_brands (
            id,
            name
          )
        )
      `)
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Trim already exists for this model' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ trim }, { status: 201 })
  } catch (error) {
    console.error('Error creating trim:', error)
    return NextResponse.json(
      { error: 'Failed to create trim' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/trims?id=<trim_id> - Delete a trim
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const trimId = searchParams.get('id')

    if (!trimId) {
      return NextResponse.json({ error: 'Trim ID is required' }, { status: 400 })
    }

    // Check if trim has reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id')
      .eq('trim_id', trimId)
      .limit(1)

    if (reviews && reviews.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete trim with existing reviews' },
        { status: 409 }
      )
    }

    // Delete trim
    const { error } = await supabase
      .from('car_trims')
      .delete()
      .eq('id', trimId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trim:', error)
    return NextResponse.json(
      { error: 'Failed to delete trim' },
      { status: 500 }
    )
  }
}

