import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { getUserFromToken } from '@/lib/auth';

// GET /api/portals/[id]
export async function GET(
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

    const portal = await prisma.portal.findUnique({
      where: { id: params.id },
      include: {
        credentials: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            bids: true,
            scrapeJobs: true,
          },
        },
      },
    });

    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    return NextResponse.json({ portal });
  } catch (error) {
    console.error('Error fetching portal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/portals/[id]
export async function PUT(
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
      isActive,
      fieldMapping,
      scraperConfig,
      username,
      password,
    } = body;

    // Update portal
    const portal = await prisma.portal.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(loginUrl !== undefined && { loginUrl }),
        ...(listingUrl && { listingUrl }),
        ...(description !== undefined && { description }),
        ...(portalType && { portalType }),
        ...(isActive !== undefined && { isActive }),
        ...(fieldMapping !== undefined && { fieldMapping }),
        ...(scraperConfig !== undefined && { scraperConfig }),
      },
    });

    // Update credentials if provided
    if (username && password) {
      const encryptedUsername = encrypt(username);
      const encryptedPassword = encrypt(password);

      // Delete existing credentials
      await prisma.portalCredential.deleteMany({
        where: { portalId: params.id },
      });

      // Create new credentials
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

    return NextResponse.json({ portal });
  } catch (error) {
    console.error('Error updating portal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/portals/[id]
export async function DELETE(
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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.portal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
