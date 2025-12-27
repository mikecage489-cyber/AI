import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { getJobStatus } from '@/lib/queue';

// GET /api/scraper/status?jobId=xxx
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific job status
      const job = await prisma.scrapeJob.findUnique({
        where: { id: jobId },
        include: {
          portal: {
            select: {
              id: true,
              name: true,
            },
          },
          logs: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      // Get queue status
      const queueStatus = await getJobStatus(jobId);

      return NextResponse.json({ job, queueStatus });
    } else {
      // Get recent jobs
      const jobs = await prisma.scrapeJob.findMany({
        include: {
          portal: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      return NextResponse.json({ jobs });
    }
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
