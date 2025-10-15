import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/cars/stats - Get review statistics for all cars or specific cars
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if specific car IDs are requested
    const { searchParams } = new URL(request.url);
    const carIds = searchParams.get('carIds')?.split(',').filter(Boolean);
    
    // Build query
    let query = supabase
      .from('reviews')
      .select('car_id, avg_score')
      .eq('status', 'published');
    
    // Filter by car IDs if provided
    if (carIds && carIds.length > 0) {
      query = query.in('car_id', carIds);
    }
    
    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching review stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review statistics' },
        { status: 500 }
      );
    }

    // Calculate stats per car
    const statsMap = new Map<string, { reviewCount: number; totalRating: number }>();
    
    reviews?.forEach(review => {
      if (review.car_id) {
        const existing = statsMap.get(review.car_id) || { reviewCount: 0, totalRating: 0 };
        statsMap.set(review.car_id, {
          reviewCount: existing.reviewCount + 1,
          totalRating: existing.totalRating + (review.avg_score || 0)
        });
      }
    });

    // Convert to array format
    const stats = Array.from(statsMap.entries()).map(([carId, data]) => ({
      carId,
      reviewCount: data.reviewCount,
      averageRating: data.reviewCount > 0 ? data.totalRating / data.reviewCount : 0
    }));

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/cars/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
