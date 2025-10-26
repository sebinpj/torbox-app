import { useState, useCallback, useRef } from 'react';
import { addToMultiupHistory } from '@/utils/multiupHistory';

export function useMultiupUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: '' });
  const [uploadedLinks, setUploadedLinks] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [failedFiles, setFailedFiles] = useState([]);
  const eventSourceRef = useRef(null);

  const uploadToMultiup = useCallback(async (selectedItems, credentials, apiKey, activeType, items) => {
    console.log('🚀 Starting Multiup stream sync:', { selectedItems, credentials, activeType });
    
    if (!credentials?.username || !credentials?.password) {
      throw new Error('Multiup credentials are required');
    }

    if (!apiKey) {
      throw new Error('API key is required');
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: 0, message: 'Starting upload...' });
    setUploadedLinks([]);
    setUploadingFiles([]);
    setFailedFiles([]);

    try {
      // Convert Set and Map to arrays for JSON serialization
      const serializedSelectedItems = {
        items: selectedItems.items ? Array.from(selectedItems.items) : [],
        files: selectedItems.files ? Array.from(selectedItems.files.entries()).map(([itemId, fileIds]) => [itemId, Array.from(fileIds)]) : []
      };

      console.log('📤 Serialized selectedItems:', serializedSelectedItems);

      // Create EventSource for Server-Sent Events
      // Note: EventSource doesn't support POST with body, so we'll use fetch with ReadableStream
      const response = await fetch('/api/multiup/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems: serializedSelectedItems,
          credentials,
          apiKey,
          activeType,
          items,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend API error:', errorData);
        throw new Error(errorData.error || 'Failed to start Multiup stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Process the stream
      let buffer = '';
      let isComplete = false;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonData);
              console.log('📡 SSE message received:', data);

              switch (data.type) {
                case 'progress':
                  setUploadProgress(data.data);
                  break;
                
                case 'fileStart':
                  setUploadingFiles(prev => [...prev, {
                    fileName: data.data.fileName,
                    index: data.data.index,
                    total: data.data.total,
                    status: 'uploading'
                  }]);
                  break;
                
                case 'fileSuccess':
                  const linkData = {
                    link: data.data.link,
                    fileName: data.data.fileName,
                    size: data.data.size,
                    originalUrl: data.data.originalUrl,
                    originalName: data.data.originalName
                  };
                  
                  setUploadedLinks(prev => [...prev, {
                    ...linkData,
                    index: data.data.index
                  }]);
                  
                  // Save to Multiup history
                  addToMultiupHistory(linkData);
                  
                  setUploadingFiles(prev => prev.filter(file => file.fileName !== data.data.fileName));
                  break;
                
                case 'fileError':
                  setFailedFiles(prev => [...prev, {
                    fileName: data.data.fileName,
                    error: data.data.error,
                    index: data.data.index,
                    total: data.data.total
                  }]);
                  setUploadingFiles(prev => prev.filter(file => file.fileName !== data.data.fileName));
                  break;
                
                case 'complete':
                  console.log('✅ Multiup stream sync completed');
                  isComplete = true;
                  setIsUploading(false);
                  break;
                
                case 'error':
                  console.error('❌ Multiup stream sync error:', data.data.message);
                  setIsUploading(false);
                  throw new Error(data.data.message);
              }
            } catch (error) {
              console.error('❌ Error parsing SSE message:', error);
            }
          }
        }
        
        if (isComplete) {
          break;
        }
      }

      return uploadedLinks;

    } catch (error) {
      console.error('❌ Error syncing to Multiup:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploadedLinks = useCallback(() => {
    setUploadedLinks([]);
    setUploadingFiles([]);
    setFailedFiles([]);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadedLinks,
    uploadingFiles,
    failedFiles,
    uploadToMultiup,
    clearUploadedLinks,
  };
}
