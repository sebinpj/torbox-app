'use client';

import Icons from '@/components/icons';
import Tooltip from '@/components/shared/Tooltip';

export default function MultiupUploadPanel({
  uploadedLinks,
  isUploading,
  uploadProgress,
  onDismiss,
  setToast,
  isUploadPanelOpen,
  setIsUploadPanelOpen,
}) {
  if (!uploadedLinks.length && !isUploading) return null;

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
    return (
      <>
        <span>
          {uploadedLinks.length > 1 ? 'Multiup Links' : 'Multiup Link'}
        </span>
        {isUploading && (
          <span className="block lg:inline text-sm text-primary-text/70 dark:text-primary-text-dark/70 lg:ml-2">
            Uploading {uploadProgress.current} of {uploadProgress.total}
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

              {/* Links */}
              <div className="p-4">
                <div className="max-h-[80vh] lg:max-h-md overflow-x-hidden overflow-y-auto flex flex-col gap-2">
                  {uploadedLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 
                      bg-surface-alt dark:bg-surface-alt-dark text-sm p-3 rounded-lg 
                      border border-border dark:border-border-dark transition-colors"
                    >
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
                  {isUploading &&
                    uploadedLinks.length < uploadProgress.total && (
                      <div className="text-primary-text dark:text-primary-text-dark/50 text-sm py-2 animate-pulse">
                        {uploadedLinks.length > 0
                          ? 'Uploading more files...'
                          : 'Starting upload...'}
                      </div>
                    )}
                </div>

                {isUploading && (
                  <div className="mt-2 w-full bg-border rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    ></div>
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
