import { NextRequest, NextResponse } from 'next/server';
import { getMemories, saveMemory, isCloudDbConfigured } from '@/lib/db';
import { uploadFile, isCloudinaryConfigured } from '@/lib/storage';

export async function GET() {
  try {
    const memories = await getMemories();
    return NextResponse.json({
      memories,
      status: {
        db: isCloudDbConfigured() ? 'cloud' : 'local',
        storage: isCloudinaryConfigured() ? 'cloud' : 'local',
      }
    });
  } catch (error: any) {
    console.error('Error fetching memories:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const date = formData.get('date') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimeType = file.type;
    
    // Determine media type (image or video)
    const mediaType = mimeType.startsWith('video/') ? 'video' : 'image';

    // Upload file (either to Cloudinary or local public/uploads)
    const uploadResult = await uploadFile(buffer, filename, mimeType);

    // Save metadata in database (either MongoDB or local JSON file)
    const savedMemory = await saveMemory({
      title,
      description,
      date: date || new Date().toISOString().split('T')[0],
      mediaUrl: uploadResult.url,
      mediaType,
    });

    return NextResponse.json({
      memory: savedMemory,
      storageType: uploadResult.storageType,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving memory:', error);
    return NextResponse.json({ error: error.message || 'Failed to save memory' }, { status: 500 });
  }
}
