import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { selectedItems, credentials, apiKey, activeType, items } = await request.json();

    console.log('🔍 Debug - Raw request body:', { selectedItems, credentials, apiKey, activeType });
    console.log('🔍 Debug - selectedItems type:', typeof selectedItems);
    console.log('🔍 Debug - selectedItems.items:', selectedItems?.items);
    console.log('🔍 Debug - selectedItems.files:', selectedItems?.files);

    if (!selectedItems || !credentials?.username || !credentials?.password || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: selectedItems, credentials, apiKey' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting Multiup sync from backend:', { selectedItems, activeType });

    // First, get download links from Torbox
    const downloadLinks = await getDownloadLinks(selectedItems, apiKey, activeType, items);
    console.log('📥 Got download links:', downloadLinks);

    if (!downloadLinks || downloadLinks.length === 0) {
      return NextResponse.json(
        { error: 'No download links found' },
        { status: 400 }
      );
    }

    // Then upload each link to Multiup with rate limiting and retry
    const uploadPromises = downloadLinks.map(async (downloadLink, index) => {
      // Rate limiting: wait 2 seconds between requests
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return await uploadWithRetry(downloadLink, credentials);
    });

    const results = await Promise.all(uploadPromises);
    console.log('🎉 All uploads completed:', results);

    return NextResponse.json({
      success: true,
      data: results.filter(result => result.link), // Filter out failed uploads
    });

  } catch (error) {
    console.error('Multiup sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync to Multiup' },
      { status: 500 }
    );
  }
}

// Helper function to get file name from items data
function getFileName(itemId, fileId, items) {
  const item = items?.find(i => i.id === itemId);
  if (!item || !item.files) return `File ${fileId}`;
  
  const file = item.files.find(f => f.id === fileId);
  return file?.short_name || file?.name || `File ${fileId}`;
}

// Helper function to get item name
function getItemName(itemId, items) {
  const item = items?.find(i => i.id === itemId);
  return item?.name || `Item ${itemId}`;
}

// Retry function with exponential backoff
async function uploadWithRetry(downloadLink, credentials, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading to Multiup (attempt ${attempt}/${maxRetries}):`, downloadLink.url);
      console.log('📝 Filename being sent:', downloadLink.name);
      
      const formData = new FormData();
      formData.append('link', downloadLink.url);
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      formData.append('fileName', downloadLink.name);

      const response = await fetch('https://multiup.io/api/remote-upload', {
        method: 'POST',
        body: formData,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Multiup API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Multiup API returns error: "success" on success, or error message on failure
      if (result.error && result.error !== "success") {
        throw new Error(result.error);
      }

      console.log('✅ Uploaded to Multiup:', result);
      return {
        link: result.link,
        fileName: result.fileName || downloadLink.name,
        size: result.size,
        originalUrl: downloadLink.url,
        originalName: downloadLink.name,
      };
    } catch (error) {
      console.error(`❌ Upload attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('❌ All retry attempts failed for:', downloadLink.name);
        throw error;
      }
      
      // Exponential backoff: wait 2^attempt seconds before retry
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function getDownloadLinks(selectedItems, apiKey, activeType, items) {
  const downloadLinks = [];
  
  // Get endpoint based on active type
  let endpoint;
  switch (activeType) {
    case 'usenet':
      endpoint = '/api/usenet/download';
      break;
    case 'webdl':
      endpoint = '/api/webdl/download';
      break;
    default:
      endpoint = '/api/torrents/download';
  }

  console.log('🔍 Processing selectedItems:', selectedItems);

  // Process selected items (now arrays instead of Sets)
  if (selectedItems.items && selectedItems.items.length > 0) {
    console.log('📦 Processing items:', selectedItems.items);
    for (const itemId of selectedItems.items) {
      try {
        const queryParams = new URLSearchParams();
        if (activeType === 'torrents') queryParams.set('torrent_id', itemId);
        if (activeType === 'usenet') queryParams.set('usenet_id', itemId);
        if (activeType === 'webdl') queryParams.set('web_id', itemId);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${endpoint}?${queryParams}`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Got download link for item ${itemId}:`, data);
          if (data.success && data.data) {
            downloadLinks.push({
              url: data.data,
              name: getItemName(itemId, items),
              itemId,
              type: 'item',
            });
          }
        } else {
          console.error(`❌ Failed to get download link for item ${itemId}:`, response.status, response.statusText);
        }
      } catch (error) {
        console.error(`Failed to get download link for item ${itemId}:`, error);
      }
    }
  }

  // Process selected files (now array of [itemId, fileIds[]] instead of Map)
  if (selectedItems.files && selectedItems.files.length > 0) {
    console.log('📁 Processing files:', selectedItems.files);
    for (const [parentId, fileIds] of selectedItems.files) {
      for (const fileId of fileIds) {
        try {
          const queryParams = new URLSearchParams();
          if (activeType === 'torrents') queryParams.set('torrent_id', parentId);
          if (activeType === 'usenet') queryParams.set('usenet_id', parentId);
          if (activeType === 'webdl') queryParams.set('web_id', parentId);
          queryParams.set('file_id', fileId);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${endpoint}?${queryParams}`, {
            method: 'GET',
            headers: {
              'x-api-key': apiKey,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Got download link for file ${fileId}:`, data);
            if (data.success && data.data) {
              downloadLinks.push({
                url: data.data,
                name: getFileName(parentId, fileId, items),
                fileId,
                parentId,
                type: 'file',
              });
            }
          } else {
            console.error(`❌ Failed to get download link for file ${fileId}:`, response.status, response.statusText);
          }
        } catch (error) {
          console.error(`Failed to get download link for file ${fileId}:`, error);
        }
      }
    }
  }

  return downloadLinks;
}
