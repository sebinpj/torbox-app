'use client';

import Icons from '@/components/icons';
import Tooltip from '@/components/shared/Tooltip';

export default function MultiupUploadPanel({
  uploadedLinks,
  uploadingFiles,
  failedFiles,
  isUploading,
  uploadProgress,
  onDismiss,
  setToast,
  isUploadPanelOpen,
  setIsUploadPanelOpen,
}) {
  if (!uploadedLinks.length && !uploadingFiles.length && !failedFiles.length && !isUploading) return null;

  const handleCopyLinks = () => {
    const text = uploadedLinks.map((link) => link.link).join('\n');
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setToast({
          message: 'Multiup links copied to clipboard',
          type: 'success',
        });
      })
      .catch((err) => {
        setToast({
          message: 'Failed to copy links',
          type: 'error',
        });
      });
  };

  const handleCopyLink = (link) => {
    navigator.clipboard
      .writeText(link.link)
      .then(() => {
        setToast({
          message: 'Link copied to clipboard',
          type: 'success',
        });
      })
      .catch((err) => {
        setToast({
          message: 'Failed to copy link',
          type: 'error',
        });
      });
  };

  const PanelTitle = () => {
    const totalFiles = uploadedLinks.length + uploadingFiles.length + failedFiles.length;
    const completedFiles = uploadedLinks.length;
    
    return (
      <>
        <span>
          {totalFiles > 1 ? 'Multiup Uploads' : 'Multiup Upload'}
        </span>
        {isUploading && (
          <span className="block lg:inline text-sm text-primary-text/70 dark:text-primary-text-dark/70 lg:ml-2">
            {uploadProgress.message || `Uploading ${completedFiles} of ${uploadProgress.total || totalFiles}`}
          </span>
        )}
        {!isUploading && totalFiles > 0 && (
          <span className="block lg:inline text-sm text-primary-text/70 dark:text-primary-text-dark/70 lg:ml-2">
            {completedFiles} completed, {failedFiles.length} failed
          </span>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      {/* Minimized State */}
      {!isUploadPanelOpen && (
        <div className="max-w-4xl mx-auto px-4">
          <div
            className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-t-lg shadow-lg p-3 cursor-pointer hover:bg-surface-alt dark:hover:bg-surface-alt-dark transition-colors"
            onClick={() => setIsUploadPanelOpen(true)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full text-blue-500/60 dark:text-blue-400/60 bg-blue-500/10 dark:bg-blue-400/10">
                  <Icons.Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-primary-text dark:text-primary-text-dark">
                  <PanelTitle />
                </h3>
              </div>
              <button className="text-primary-text/70 dark:text-primary-text-dark/70 hover:text-primary-text dark:hover:text-primary-text-dark transition-colors">
                <Icons.ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maximized State */}
      {isUploadPanelOpen && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            <div className="mt-4 border border-border dark:border-border-dark rounded-t-lg bg-surface dark:bg-surface-dark shadow-lg">
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 border-b border-border dark:border-border-dark cursor-pointer hover:bg-surface-alt dark:hover:bg-surface-alt-dark transition-colors"
                onClick={() => setIsUploadPanelOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-md font-medium text-primary-text dark:text-primary-text-dark">
                    <PanelTitle />
                  </h3>
                </div>
                <button className="text-primary-text/70 dark:text-primary-text-dark/70 hover:text-primary-text dark:hover:text-primary-text-dark transition-colors">
                  <Icons.ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Files */}
              <div className="p-4">
                <div className="max-h-[80vh] lg:max-h-md overflow-x-hidden overflow-y-auto flex flex-col gap-2">
                  {/* Successfully uploaded files */}
                  {uploadedLinks.map((link, index) => (
                    <div
                      key={`success-${index}`}
                      className="flex items-center gap-2 
                      bg-green-50 dark:bg-green-900/20 text-sm p-3 rounded-lg 
                      border border-green-200 dark:border-green-800 transition-colors"
                    >
                      <div className="p-1 rounded-full text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/30">
                        <Icons.Check className="w-4 h-4" />
                      </div>
                      <div className="relative group min-w-0 flex-1">
                        <Tooltip content={link.fileName}>
                          <div className="block w-full truncate text-primary-text dark:text-primary-text-dark">
                            <div className="font-medium">{link.fileName}</div>
                            <div className="text-xs text-primary-text/70 dark:text-primary-text-dark/70">
                              {link.link}
                            </div>
                            {link.size && (
                              <div className="text-xs text-primary-text/50 dark:text-primary-text-dark/50">
                                Size: {link.size}
                              </div>
                            )}
                          </div>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopyLink(link)}
                          className="p-1.5 rounded-full text-blue-500 dark:text-blue-400 
                            hover:bg-blue-500/5 dark:hover:bg-blue-400/5 transition-colors select-none"
                          title="Copy link"
                        >
                          <Icons.Copy className="w-5 h-5" />
                        </button>
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full text-blue-500 dark:text-blue-400 
                            hover:bg-blue-500/5 dark:hover:bg-blue-400/5 transition-colors select-none"
                          title="Open link"
                        >
                          <Icons.ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Currently uploading files */}
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={`uploading-${index}`}
                      className="flex items-center gap-2 
                      bg-blue-50 dark:bg-blue-900/20 text-sm p-3 rounded-lg 
                      border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      <div className="p-1 rounded-full text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 animate-spin">
                        <Icons.Loader className="w-4 h-4" />
                      </div>
                      <div className="relative group min-w-0 flex-1">
                        <div className="block w-full truncate text-primary-text dark:text-primary-text-dark">
                          <div className="font-medium">{file.fileName}</div>
                          <div className="text-xs text-primary-text/70 dark:text-primary-text-dark/70">
                            Uploading... ({file.index}/{file.total})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Failed files */}
                  {failedFiles.map((file, index) => (
                    <div
                      key={`failed-${index}`}
                      className="flex items-center gap-2 
                      bg-red-50 dark:bg-red-900/20 text-sm p-3 rounded-lg 
                      border border-red-200 dark:border-red-800 transition-colors"
                    >
                      <div className="p-1 rounded-full text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
                        <Icons.Times className="w-4 h-4" />
                      </div>
                      <div className="relative group min-w-0 flex-1">
                        <Tooltip content={file.error}>
                          <div className="block w-full truncate text-primary-text dark:text-primary-text-dark">
                            <div className="font-medium">{file.fileName}</div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                              Failed: {file.error}
                            </div>
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  ))}

                  {/* Status message when uploading */}
                  {isUploading && uploadingFiles.length === 0 && uploadedLinks.length === 0 && (
                    <div className="text-primary-text dark:text-primary-text-dark/50 text-sm py-2 animate-pulse">
                      {uploadProgress.message || 'Preparing uploads...'}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {isUploading && uploadProgress.total > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-primary-text/70 dark:text-primary-text-dark/70 mb-1">
                      <span>{uploadProgress.message || `Uploading ${uploadProgress.current} of ${uploadProgress.total}`}</span>
                      <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-border dark:bg-border-dark rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-4">
                  <button
                    onClick={onDismiss}
                    className="text-sm text-primary-text/70 dark:text-primary-text-dark/70 hover:text-primary-text dark:hover:text-primary-text-dark transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleCopyLinks}
                    className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Icons.Copy className="w-5 h-5" />
                    Copy All Links
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
