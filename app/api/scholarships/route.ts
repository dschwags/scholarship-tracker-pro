import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { scholarships, applications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET: Fetch scholarships for authenticated user
export async function GET(request: NextRequest) {
  console.log('📋 /api/scholarships: Starting scholarship fetch...')
  
  try {
    const session = await getSession()
    if (!session) {
      console.log('❌ /api/scholarships: No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ /api/scholarships: Session valid, fetching scholarships for user:', session.user.id)
    
    // Get scholarships created by this user along with application data
    const userScholarships = await db
      .select({
        id: scholarships.id,
        title: scholarships.title,
        description: scholarships.description,
        amount: scholarships.amount,
        currency: scholarships.currency,
        provider: scholarships.provider,
        applicationDeadline: scholarships.applicationDeadline,
        status: scholarships.status,
        createdAt: scholarships.createdAt,
      })
      .from(scholarships)
      .where(eq(scholarships.createdBy, session.user.id))

    console.log('📊 /api/scholarships: Found scholarships:', { count: userScholarships.length })
    
    return NextResponse.json({ 
      scholarships: userScholarships,
      totalCount: userScholarships.length 
    })

  } catch (error) {
    console.error('❌ /api/scholarships: Error fetching scholarships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scholarships' }, 
      { status: 500 }
    )
  }
}

// POST: Create a new scholarship
export async function POST(request: NextRequest) {
  console.log('💾 /api/scholarships: Starting scholarship creation...')
  
  try {
    const session = await getSession()
    if (!session) {
      console.log('❌ /api/scholarships: No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 /api/scholarships: Received data:', { 
      title: body.title, 
      amount: body.amount, 
      deadline: body.deadline 
    })

    // Validate required fields
    if (!body.title || !body.amount || !body.deadline) {
      console.log('❌ /api/scholarships: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: title, amount, deadline' }, 
        { status: 400 }
      )
    }

    // Create scholarship record
    const newScholarship = {
      title: body.title,
      description: body.description || 'Scholarship created via Quick Add',
      amount: body.amount.toString(), // Convert to string for decimal field
      currency: 'USD',
      provider: body.provider || 'Self-Added',
      applicationDeadline: new Date(body.deadline),
      eligibilityRequirements: body.eligibilityRequirements || 'To be determined',
      educationLevel: 'undergraduate' as const,
      status: 'active' as const,
      createdBy: session.user.id,
    }

    console.log('💾 /api/scholarships: Inserting scholarship into database...')
    
    const [createdScholarship] = await db
      .insert(scholarships)
      .values(newScholarship)
      .returning()

    console.log('✅ /api/scholarships: Scholarship created successfully:', { 
      id: createdScholarship.id, 
      title: createdScholarship.title,
      amount: createdScholarship.amount 
    })

    // Also create an application record in draft status for this user
    const newApplication = {
      userId: session.user.id,
      scholarshipId: createdScholarship.id,
      status: 'draft' as const,
      notes: 'Application created via Quick Add',
    }

    console.log('📝 /api/scholarships: Creating application record...')
    
    const [createdApplication] = await db
      .insert(applications)
      .values(newApplication)
      .returning()

    console.log('✅ /api/scholarships: Application created successfully:', { 
      id: createdApplication.id 
    })

    return NextResponse.json({
      scholarship: createdScholarship,
      application: createdApplication,
      message: 'Scholarship and application created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ /api/scholarships: Error creating scholarship:', error)
    return NextResponse.json(
      { error: 'Failed to create scholarship' }, 
      { status: 500 }
    )
  }
}