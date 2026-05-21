import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';

export interface Memory {
  id: string;
  title: string;
  description?: string;
  date: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Initialize MongoDB client if env is present
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'digital-memories';

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient;
}

async function getDb(): Promise<Db> {
  if (mongoDb) return mongoDb;
  const client = await getMongoClient();
  mongoDb = client.db(MONGODB_DB);
  return mongoDb;
}

// Ensure local JSON database directory exists
function ensureLocalDbExists() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Initial mock data to display something beautiful on the first run
const MOCK_MEMORIES: Memory[] = [
  {
    id: 'mock-1',
    title: 'Late Summer Solitude',
    description: 'Golden hour filtering through the old oak tree in the countryside. The warm breeze carried whispers of autumn.',
    date: '2025-08-15',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Rainy Night in Kyoto',
    description: 'Neon signs reflecting on the wet cobblestone streets of Gion. A quiet walk under a paper umbrella.',
    date: '2025-10-02',
    mediaUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Ocean Melancholy',
    description: 'Looking out at the endless horizon, waves gently breaking against the rocks. Time stood still for a moment.',
    date: '2026-02-12',
    mediaUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    title: 'The Silent Forest Path',
    description: 'Mist rising from the damp ground as the first morning light breaks through the pine canopy.',
    date: '2026-04-18',
    mediaUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    createdAt: new Date().toISOString(),
  }
];

export async function getMemories(): Promise<Memory[]> {
  if (MONGODB_URI) {
    try {
      const db = await getDb();
      const collection = db.collection<Memory>('memories');
      const results = await collection.find({}).sort({ createdAt: -1 }).toArray();
      // Map MongoDB _id out or cast to string
      return results.map(doc => ({
        id: doc.id || (doc as any)._id.toString(),
        title: doc.title,
        description: doc.description,
        date: doc.date,
        mediaUrl: doc.mediaUrl,
        mediaType: doc.mediaType,
        createdAt: doc.createdAt,
      }));
    } catch (err) {
      console.error('Failed to connect to MongoDB, falling back to local database:', err);
    }
  }

  // Local JSON Fallback
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const memories: Memory[] = JSON.parse(data);
    
    // If the local file database is completely empty, prepopulate it with Mock memories
    if (memories.length === 0) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(MOCK_MEMORIES, null, 2), 'utf-8');
      return MOCK_MEMORIES;
    }
    
    return memories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error reading local db:', error);
    return MOCK_MEMORIES;
  }
}

export async function saveMemory(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory> {
  const newMemory: Memory = {
    ...memory,
    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
  };

  if (MONGODB_URI) {
    try {
      const db = await getDb();
      const collection = db.collection<Memory>('memories');
      await collection.insertOne(newMemory);
      return newMemory;
    } catch (err) {
      console.error('Failed to save to MongoDB, falling back to local database:', err);
    }
  }

  // Local JSON Fallback
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const memories: Memory[] = JSON.parse(data);
    memories.push(newMemory);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(memories, null, 2), 'utf-8');
    return newMemory;
  } catch (error) {
    console.error('Error writing to local db:', error);
    throw new Error('Failed to save memory to local storage');
  }
}

export function isCloudDbConfigured(): boolean {
  return !!MONGODB_URI;
}

export async function deleteMemory(id: string): Promise<void> {
  if (MONGODB_URI) {
    try {
      const db = await getDb();
      const collection = db.collection<Memory>('memories');
      await collection.deleteOne({ id });
      return;
    } catch (err) {
      console.error('Failed to delete from MongoDB, falling back to local database:', err);
    }
  }

  // Local JSON Fallback
  ensureLocalDbExists();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    const memories: Memory[] = JSON.parse(data);
    const updatedMemories = memories.filter(m => m.id !== id);
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(updatedMemories, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to local db during delete:', error);
    throw new Error('Failed to delete memory from local storage');
  }
}

