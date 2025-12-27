import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

// POST /api/bids/export
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { format = 'CSV', filters = {} } = body;

    // Build where clause from filters
    const where: any = {};
    if (filters.portalId) where.portalId = filters.portalId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Fetch bids
    const bids = await prisma.bid.findMany({
      where,
      include: {
        portal: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Prepare data for export
    const exportData = bids.map(bid => ({
      'Portal': bid.portal.name,
      'Requisition Number': bid.requisitionNumber || '',
      'Bid Number': bid.bidNumber || '',
      'Solicitation Number': bid.solicitationNumber || '',
      'Title': bid.title,
      'Description': bid.description || '',
      'Open Date': bid.openDate ? bid.openDate.toISOString() : '',
      'Close Date': bid.closeDate ? bid.closeDate.toISOString() : '',
      'Quantity': bid.quantity || '',
      'Unit of Measure': bid.unitOfMeasure || '',
      'Detail URL': bid.detailPageUrl || '',
      'Status': bid.status,
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bids');

    // Generate buffer
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: format === 'EXCEL' ? 'xlsx' : 'csv' 
    });

    const filename = `bids-export-${Date.now()}.${format === 'EXCEL' ? 'xlsx' : 'csv'}`;

    // Create export record
    await prisma.export.create({
      data: {
        userId: user.id,
        format: format === 'EXCEL' ? 'EXCEL' : 'CSV',
        filename,
        filters,
        status: 'COMPLETED',
        recordCount: bids.length,
        completedAt: new Date(),
      },
    });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': format === 'EXCEL' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting bids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
