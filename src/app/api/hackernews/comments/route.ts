import { NextResponse } from 'next/server';

export interface Comment {
  id: number;
  by: string;
  text: string;
  time: number;
  kids: Comment[];
  deleted?: boolean;
}

const HN_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

// Recursive function to fetch a comment and all its children
async function fetchComment(id: number): Promise<Comment | null> {
  const response = await fetch(`${HN_BASE_URL}/item/${id}.json`);
  if (!response.ok) return null;

  const data = await response.json();
  // Return null for deleted or dead comments so they can be filtered out
  if (!data || data.deleted || data.dead) return null;

  // Recursively fetch child comments, if they exist
  const childComments = data.kids
    ? await Promise.all(data.kids.map(fetchComment))
    : [];

  return {
    id: data.id,
    by: data.by,
    text: data.text,
    time: data.time,
    // Filter out any null results from the children array
    kids: childComments.filter((c): c is Comment => c !== null),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get('id');

  if (!storyId) {
    return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
  }

  try {
    // First, get the main story to find its top-level comment IDs ('kids')
    const storyResponse = await fetch(`${HN_BASE_URL}/item/${storyId}.json`);
    if (!storyResponse.ok) {
        throw new Error('Failed to fetch story details');
    }
    const storyData = await storyResponse.json();
    
    if (!storyData.kids || storyData.kids.length === 0) {
        return NextResponse.json([]); // Story has no comments
    }

    // Fetch all top-level comments and their nested children
    const comments = await Promise.all(storyData.kids.map(fetchComment));

    const validComments = comments.filter((c): c is Comment => c !== null);

    return NextResponse.json(validComments);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[HN Comments API ERROR]', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}