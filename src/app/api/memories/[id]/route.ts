import { NextRequest, NextResponse } from 'next/server';
import { deleteMemory, getMemories } from '@/lib/db';
import { deleteFile } from '@/lib/storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Fetch memories to find the memory and its mediaUrl
    const memories = await getMemories();
    const memory = memories.find(m => m.id === id);
    
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }
    
    // 2. Delete the associated file from Cloudinary or Local storage
    if (memory.mediaUrl) {
      await deleteFile(memory.mediaUrl);
    }
    
    // 3. Delete the metadata from the database (MongoDB or local JSON)
    await deleteMemory(id);
    
    return NextResponse.json({ success: true, message: 'Memory permanently forgotten' });
  } catch (error: any) {
    console.error('Error deleting memory:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete memory' }, { status: 500 });
  }
}
