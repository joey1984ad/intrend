import { put, del, list } from '@vercel/blob';
import { NextRequest } from 'next/server';

// Upload a file to Vercel Blob
export async function uploadFile(file: File | Buffer, filename: string, userId: string) {
  try {
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`✅ File uploaded: ${blob.url}`);
    return blob;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
}

// Upload CSV export data
export async function uploadCSVExport(data: string, userId: string, dateRange: string) {
  try {
    const filename = `exports/${userId}/facebook-ads-${dateRange}-${Date.now()}.csv`;
    const blob = await put(filename, data, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'text/csv',
    });

    console.log(`✅ CSV export uploaded: ${blob.url}`);
    return blob;
  } catch (error) {
    console.error('❌ Error uploading CSV export:', error);
    throw error;
  }
}

// Upload PDF report
export async function uploadPDFReport(pdfBuffer: Buffer, userId: string, dateRange: string) {
  try {
    const filename = `reports/${userId}/facebook-report-${dateRange}-${Date.now()}.pdf`;
    const blob = await put(filename, pdfBuffer, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'application/pdf',
    });

    console.log(`✅ PDF report uploaded: ${blob.url}`);
    return blob;
  } catch (error) {
    console.error('❌ Error uploading PDF report:', error);
    throw error;
  }
}

// List user's files
export async function listUserFiles(userId: string) {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: `exports/${userId}/`,
    });

    return blobs;
  } catch (error) {
    console.error('❌ Error listing user files:', error);
    return [];
  }
}

// Delete a file
export async function deleteFile(url: string) {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`✅ File deleted: ${url}`);
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
}

// Generate CSV from campaign data
export function generateCSV(campaigns: any[], dateRange: string) {
  const headers = [
    'Campaign Name',
    'Clicks',
    'Impressions',
    'Reach',
    'Spend',
    'CPC',
    'CPM',
    'CTR',
    'Status',
    'Objective',
    'Date Range'
  ];

  const rows = campaigns.map(campaign => [
    campaign.campaign_name || campaign.name,
    campaign.clicks || campaign.insights?.clicks || 0,
    campaign.impressions || campaign.insights?.impressions || 0,
    campaign.reach || campaign.insights?.reach || 0,
    campaign.spend || campaign.insights?.spend || 0,
    campaign.cpc || campaign.insights?.cpc || 0,
    campaign.cpm || campaign.insights?.cpm || 0,
    campaign.ctr || campaign.insights?.ctr || '0%',
    campaign.status || 'UNKNOWN',
    campaign.objective || 'UNKNOWN',
    dateRange
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
} 