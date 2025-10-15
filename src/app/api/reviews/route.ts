import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews - Fetch reviews
// Query params: carId (optional)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get('carId');

    const supabase = await createClient();
    
    let query = supabase
      .from('reviews')
      .select(`
        id,
        car_id,
        author_id,
        body,
        ratings,
        avg_score,
        status,
        created_at,
        profiles:author_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    // Filter by car_id if provided
    if (carId) {
      query = query.eq('car_id', carId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Also get vote counts for each review
    const reviewIds = reviews?.map(r => r.id) || [];
    let votesData: Array<{ review_id: number; is_helpful: boolean }> = [];
    
    if (reviewIds.length > 0) {
      const { data: votes } = await supabase
        .from('review_votes')
        .select('review_id, is_helpful')
        .in('review_id', reviewIds)
        .eq('is_helpful', true);
      
      votesData = votes || [];
    }

    // Count helpful votes per review
    const voteCountMap = votesData.reduce((acc: Record<number, number>, vote) => {
      acc[vote.review_id] = (acc[vote.review_id] || 0) + 1;
      return acc;
    }, {});

    // Transform to frontend format
    const transformedReviews = reviews?.map(review => ({
      id: review.id.toString(),
      carId: review.car_id || '',
      userId: review.author_id,
      createdAt: review.created_at,
      text: review.body || '',
      ratings: review.ratings as Record<string, number>,
      overall: review.avg_score || 0,
      helpfulCount: voteCountMap[review.id] || 0,
      user: review.profiles ? {
        id: review.profiles.id,
        name: review.profiles.username || review.profiles.full_name || 'User',
        username: review.profiles.username || null,
        fullName: review.profiles.full_name || null,
        avatarUrl: review.profiles.avatar_url || null,
      } : null,
    })) || [];

    return NextResponse.json({ reviews: transformedReviews });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { carId, text, ratings } = body;

    // Validate required fields
    if (!carId || !text || !ratings) {
      return NextResponse.json(
        { error: 'Missing required fields: carId, text, ratings' },
        { status: 400 }
      );
    }

    // Calculate average score
    const ratingValues = Object.values(ratings) as number[];
    const avgScore = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        author_id: user.id,
        car_id: carId,
        body: text,
        ratings: ratings,
        avg_score: avgScore,
        status: 'published',
      })
      .select(`
        id,
        car_id,
        author_id,
        body,
        ratings,
        avg_score,
        status,
        created_at,
        profiles:author_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json(
        { error: 'Failed to create review', details: insertError.message },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const transformedReview = {
      id: review.id.toString(),
      carId: review.car_id || '',
      userId: review.author_id,
      createdAt: review.created_at,
      text: review.body || '',
      ratings: review.ratings as Record<string, number>,
      overall: review.avg_score || 0,
      helpfulCount: 0,
      user: review.profiles ? {
        id: review.profiles.id,
        name: review.profiles.username || review.profiles.full_name || 'User',
        username: review.profiles.username || null,
        fullName: review.profiles.full_name || null,
        avatarUrl: review.profiles.avatar_url || null,
      } : null,
    };

    return NextResponse.json({ review: transformedReview }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

