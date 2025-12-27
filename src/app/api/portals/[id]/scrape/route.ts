import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { addScrapeJob } from '@/lib/queue';

// POST /api/portals/[id]/scrape
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if portal exists
    const portal = await prisma.portal.findUnique({
      where: { id: params.id },
    });

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    if (!portal.isActive) {
      return NextResponse.json(
        { error: 'Portal is not active' },
        { status: 400 }
      );
    }

    // Create scrape job
    const job = await prisma.scrapeJob.create({
      data: {
        portalId: params.id,
        status: 'PENDING',
        jobType: 'MANUAL',
      },
    });

    // Add to queue
    await addScrapeJob({
      portalId: params.id,
      jobId: job.id,
      jobType: 'manual',
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Error creating scrape job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
