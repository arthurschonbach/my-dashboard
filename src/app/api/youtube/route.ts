import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();
const handleToIdCache = new Map<string, string>();

export const revalidate = 900; // Cache for 15 minutes

/**
 * Fetches a channel's page to find the canonical channel ID.
 * Caches the result to avoid redundant fetches.
 * @param handle The channel's handle (e.g., '@MKBHD')
 * @returns The channel ID (e.g., 'UCBJycsmduvYEL83R_U4JriQ') or null if not found.
 */
async function getChannelIdFromHandle(handle: string): Promise<string | null> {
  const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`;
  
  if (handleToIdCache.has(normalizedHandle)) {
    return handleToIdCache.get(normalizedHandle)!;
  }

  try {
    const response = await fetch(`https://www.youtube.com/${normalizedHandle}`);
    if (!response.ok) {
        console.error(`Failed to fetch channel page for ${normalizedHandle}: ${response.status}`);
        return null;
    }
    const html = await response.text();

    // The channel ID is in a <meta> tag like: <meta property="og:url" content="https://www.youtube.com/channel/UC...">
    const match = html.match(/<meta\s+property="og:url"\s+content="https:\/\/www.youtube.com\/channel\/([^"]+)">/);
    
    if (match && match[1]) {
      const channelId = match[1];
      handleToIdCache.set(normalizedHandle, channelId); // Cache the found ID
      return channelId;
    }

    console.warn(`Could not find channel ID for ${normalizedHandle}.`);
    return null;
  } catch (error) {
    console.error(`Error fetching or parsing page for ${handle}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handles = searchParams.get('handles')?.split(',');

  if (!handles || handles.length === 0) {
    return NextResponse.json({ error: 'Channel handles are required' }, { status: 400 });
  }

  try {
    // Step 1: Convert all handles to Channel IDs
    const idPromises = handles.map(handle => getChannelIdFromHandle(handle));
    const channelIds = (await Promise.all(idPromises)).filter((id): id is string => id !== null);

    if (channelIds.length === 0) {
      return NextResponse.json({ error: 'Could not resolve any channel handles to IDs' }, { status: 404 });
    }

    // Step 2: Fetch RSS feeds using the resolved Channel IDs
    const rssPromises = channelIds.map(async (channelId) => {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const feed = await parser.parseURL(feedUrl);
      return feed.items || [];
    });

    const allItems = (await Promise.all(rssPromises)).flat();

    // The rest of the logic remains the same...
    const filteredItems = allItems.filter(item => {
      const link = item.link?.toLowerCase() || '';
      return !link.includes('/shorts/');
    });

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentItems = filteredItems.filter(item => {
      const pubDate = new Date(item.pubDate || '').getTime();
      return !isNaN(pubDate) && pubDate > sevenDaysAgo;
    });

    recentItems.sort((a, b) =>
      new Date(b.pubDate || '').getTime() - new Date(a.pubDate || '').getTime()
    );

    return NextResponse.json(recentItems);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}