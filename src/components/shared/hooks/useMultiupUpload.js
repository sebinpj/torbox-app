import { useState, useCallback } from 'react';

export function useMultiupUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadedLinks, setUploadedLinks] = useState([]);

  const uploadToMultiup = useCallback(async (selectedItems, credentials, apiKey, activeType, items) => {
    console.log('🚀 Starting Multiup sync:', { selectedItems, credentials, activeType });
    
    if (!credentials?.username || !credentials?.password) {
      throw new Error('Multiup credentials are required');
    }

    if (!apiKey) {
      throw new Error('API key is required');
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: 0 });
    setUploadedLinks([]);

    try {
      // Convert Set and Map to arrays for JSON serialization
      const serializedSelectedItems = {
        items: selectedItems.items ? Array.from(selectedItems.items) : [],
        files: selectedItems.files ? Array.from(selectedItems.files.entries()).map(([itemId, fileIds]) => [itemId, Array.from(fileIds)]) : []
      };

      console.log('📤 Serialized selectedItems:', serializedSelectedItems);

      const response = await fetch('/api/multiup/sync', {
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
        throw new Error(errorData.error || 'Failed to sync to Multiup');
      }

      const result = await response.json();
      console.log('📡 Backend API response:', result);

      if (!result.success) {
        console.error('❌ Backend API error:', result.error);
        throw new Error(result.error || 'Failed to sync to Multiup');
      }

      console.log('✅ Multiup sync completed:', result.data);
      setUploadedLinks(result.data);
      setUploadProgress({ current: result.data.length, total: result.data.length });
      
      return result.data;
    } catch (error) {
      console.error('❌ Error syncing to Multiup:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploadedLinks = useCallback(() => {
    setUploadedLinks([]);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadedLinks,
    uploadToMultiup,
    clearUploadedLinks,
  };
}
