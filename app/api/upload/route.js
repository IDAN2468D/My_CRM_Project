import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCustomerFolder, uploadFileToDrive } from '@/lib/gdrive';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const customerId = formData.get('customerId');
    const customerName = formData.get('customerName');

    if (!file || !customerId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const fileName = file.name;

    // 1. Ensure a drive folder exists for this specific customer
    const folderId = await createCustomerFolder(customerName || customerId);
    
    // 2. Upload file directly to Google Drive folder
    const uploadResult = await uploadFileToDrive(buffer, fileName, mimeType, folderId);

    // 3. Save the Web URL back to MongoDB
    await dbConnect();
    await Customer.findByIdAndUpdate(customerId, {
      $push: {
        documents: {
          name: fileName,
          url: uploadResult.webViewLink,
          type: mimeType,
          uploadedAt: new Date()
        }
      }
    });

    return NextResponse.json({ success: true, url: uploadResult.webViewLink });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
