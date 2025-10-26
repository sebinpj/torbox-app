import { useState, useEffect } from 'react';
import { phEvent } from '@/utils/sa';
import useIsMobile from '@/hooks/useIsMobile';
import { useTranslations } from 'next-intl';
import Icons from '@/components/icons';
import Tooltip from '@/components/shared/Tooltip';
import MultiupCredentialsInput from '../../MultiupCredentialsInput';
import MultiupUploadPanel from '../../MultiupUploadPanel';
import { useMultiupUpload } from '../../../shared/hooks/useMultiupUpload';

export default function ActionButtons({
  selectedItems,
  setSelectedItems,
  hasSelectedFiles,
  isDownloading,
  isDeleting,
  onBulkDownload,
  onBulkDelete,
  itemTypeName,
  itemTypePlural,
  isDownloadPanelOpen,
  setIsDownloadPanelOpen,
  downloadLinks,
  setToast,
  handleBulkDownload,
  items,
  apiKey,
  activeType,
}) {
  const t = useTranslations('ActionButtons');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteParentDownloads, setDeleteParentDownloads] = useState(false);
  const [showMultiupCredentials, setShowMultiupCredentials] = useState(false);
  const [multiupCredentials, setMultiupCredentials] = useState(null);
  const [isMultiupPanelOpen, setIsMultiupPanelOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    isUploading: isMultiupUploading,
    uploadProgress: multiupUploadProgress,
    uploadedLinks: multiupUploadedLinks,
    uploadToMultiup,
    clearUploadedLinks: clearMultiupUploadedLinks,
  } = useMultiupUpload();


  const handleDownloadClick = () => {
    onBulkDownload();
    if (!isDownloadPanelOpen) {
      setIsDownloadPanelOpen(true);
    }
    phEvent('download_items');
  };

  const handleSyncToMultiup = async () => {
    if (!multiupCredentials) {
      setShowMultiupCredentials(true);
      return;
    }

    if (!apiKey) {
      setToast({
        type: 'error',
        message: 'API key is required for Multiup sync',
      });
      return;
    }

    try {
      await uploadToMultiup(selectedItems, multiupCredentials, apiKey, activeType, items);
      setIsMultiupPanelOpen(true);
      phEvent('sync_to_multiup');
    } catch (error) {
      console.error('Error syncing to Multiup:', error);
      setToast({
        type: 'error',
        message: error.message || 'Failed to sync to Multiup',
      });
      phEvent('sync_to_multiup_error', { error: error.message });
    }
  };

  const getDownloadButtonText = () => {
    if (isDownloading) return t('fetchingLinks');
    return isMobile ? t('downloadLinksMobile') : t('downloadLinks');
  };

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleDownloadClick}
        disabled={isDownloading}
        className="bg-accent text-white text-xs lg:text-sm px-4 py-1.5 rounded hover:bg-accent/90 
        disabled:opacity-50 transition-colors"
      >
        {getDownloadButtonText()}
      </button>

        <button
          onClick={handleSyncToMultiup}
          disabled={isMultiupUploading}
          className="bg-blue-500 text-white text-xs lg:text-sm px-4 py-1.5 rounded hover:bg-blue-600 
          disabled:opacity-50 transition-colors"
        >
          {isMultiupUploading ? 'Syncing...' : 'Sync to Multiup'}
        </button>

      {(selectedItems.items?.size > 0 || hasSelectedFiles()) && (
        <>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="bg-red-500 text-white text-xs lg:text-sm px-4 py-1.5 rounded hover:bg-red-600 
            disabled:opacity-50 transition-colors"
          >
            {isDeleting
              ? t('deleteConfirm.deleting')
              : t('deleteConfirm.confirm')}
          </button>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow-lg max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-primary-text dark:text-primary-text-dark">
                  {t('deleteConfirm.title')}
                </h3>
                <p className="text-primary-text/70 dark:text-primary-text-dark/70 mb-6">
                  {t('deleteConfirm.message', {
                    count:
                      selectedItems.items?.size +
                      (deleteParentDownloads ? selectedItems.files?.size : 0),
                    type:
                      selectedItems.items?.size === 1
                        ? itemTypeName
                        : itemTypePlural,
                  })}
                </p>

                {hasSelectedFiles() && (
                  <label className="flex gap-3 mb-6 text-sm text-primary-text/70 dark:text-primary-text-dark/70">
                    <input
                      type="checkbox"
                      checked={deleteParentDownloads}
                      onChange={(e) =>
                        setDeleteParentDownloads(e.target.checked)
                      }
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    {t('deleteConfirm.includeParentDownloads')}
                    <Tooltip
                      content={t('deleteConfirm.includeParentDownloadsTooltip')}
                    >
                      <Icons.Question />
                    </Tooltip>
                  </label>
                )}

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-primary-text/70 dark:text-primary-text-dark/70 
                    hover:text-primary-text dark:hover:text-primary-text-dark"
                  >
                    {t('deleteConfirm.cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      onBulkDelete(deleteParentDownloads);
                      phEvent('delete_items', {
                        includeParents: deleteParentDownloads,
                      });
                    }}
                    disabled={isDeleting}
                    className="bg-red-500 text-sm text-white px-4 py-2 rounded hover:bg-red-600 
                    disabled:opacity-50 transition-colors"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={() => setSelectedItems({ items: new Set(), files: new Map() })}
        className="text-sm text-primary-text/70 dark:text-primary-text-dark/70 hover:text-primary-text dark:hover:text-primary-text-dark"
      >
        {t('clear')}
      </button>

      {/* Multiup Credentials Modal */}
      {showMultiupCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface dark:bg-surface-dark p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-text dark:text-primary-text-dark">
                Multiup Credentials Required
              </h3>
              <button
                onClick={() => setShowMultiupCredentials(false)}
                className="text-primary-text/50 dark:text-primary-text-dark/50 hover:text-primary-text 
                dark:hover:text-primary-text-dark transition-colors p-1"
              >
                <Icons.Times className="w-5 h-5" />
              </button>
            </div>
            <p className="text-primary-text/70 dark:text-primary-text-dark/70 mb-6">
              Please select or add your Multiup account credentials to sync files.
            </p>
            <MultiupCredentialsInput
              credentials={multiupCredentials}
              onCredentialsChange={(creds) => {
                setMultiupCredentials(creds);
                setShowMultiupCredentials(false);
              }}
              allowCredentialsManager={true}
            />
          </div>
        </div>
      )}

      {/* Multiup Upload Panel */}
      <MultiupUploadPanel
        uploadedLinks={multiupUploadedLinks}
        isUploading={isMultiupUploading}
        uploadProgress={multiupUploadProgress}
        onDismiss={clearMultiupUploadedLinks}
        setToast={setToast}
        isUploadPanelOpen={isMultiupPanelOpen}
        setIsUploadPanelOpen={setIsMultiupPanelOpen}
      />
    </div>
  );
}
