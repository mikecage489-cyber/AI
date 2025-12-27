import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { getUserFromToken } from '@/lib/auth';

// GET /api/portals - List all portals
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

    const portals = await prisma.portal.findMany({
      include: {
        credentials: {
          select: {
            id: true,
            // Don't return encrypted credentials in list
          },
        },
        _count: {
          select: {
            bids: true,
            scrapeJobs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ portals });
  } catch (error) {
    console.error('Error fetching portals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/portals - Create a new portal
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      loginUrl,
      listingUrl,
      description,
      portalType,
      fieldMapping,
      scraperConfig,
      username,
      password,
    } = body;

    if (!name || !listingUrl) {
      return NextResponse.json(
        { error: 'Name and listing URL are required' },
        { status: 400 }
      );
    }

    // Create portal
    const portal = await prisma.portal.create({
      data: {
        name,
        loginUrl,
        listingUrl,
        description,
        portalType: portalType || 'PUBLIC',
        fieldMapping: fieldMapping || undefined,
        scraperConfig: scraperConfig || undefined,
      },
    });

    // Create credentials if provided
    if (username && password) {
      const encryptedUsername = encrypt(username);
      const encryptedPassword = encrypt(password);

      await prisma.portalCredential.create({
        data: {
          portalId: portal.id,
          encryptedUsername: encryptedUsername.encrypted,
          encryptedPassword: encryptedPassword.encrypted,
          iv: encryptedUsername.iv,
          authTag: encryptedUsername.authTag,
        },
      });
    }

    return NextResponse.json({ portal }, { status: 201 });
  } catch (error) {
    console.error('Error creating portal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
