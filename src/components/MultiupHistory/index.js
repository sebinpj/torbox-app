'use client';

import { timeAgo } from '@/components/downloads/utils/formatters';
import Icons from '@/components/icons';
import { useTranslations } from 'next-intl';
import useIsMobile from '@/hooks/useIsMobile';

const MultiupHistory = ({ history, onDelete }) => {
  const t = useTranslations('Common');
  const multiupHistoryT = useTranslations('MultiupHistory');
  const isMobile = useIsMobile();

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatFileSize = (size) => {
    if (!size) return '-';
    const bytes = parseInt(size);
    if (isNaN(bytes)) return size;
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let fileSize = bytes;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const getCreatedDate = (createdAt) => {
    return timeAgo(new Date(createdAt), t);
  };

  if (history.length === 0) {
    return (
      <div className="mt-8 text-center">
        <div className="p-8 bg-surface-alt dark:bg-surface-alt-dark rounded-lg border border-border dark:border-border-dark">
          <Icons.CloudUpload className="w-12 h-12 mx-auto text-primary-text/30 dark:text-primary-text-dark/30 mb-4" />
          <h3 className="text-lg font-medium text-primary-text dark:text-primary-text-dark mb-2">
            {multiupHistoryT('empty.title')}
          </h3>
          <p className="text-sm text-primary-text/70 dark:text-primary-text-dark/70">
            {multiupHistoryT('empty.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-medium text-primary-text dark:text-primary-text-dark mb-4">
        {multiupHistoryT('title')}
      </h2>
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border dark:border-border-dark">
        <table className="min-w-full table-fixed divide-y divide-border dark:divide-border-dark relative">
          <thead className="bg-surface-alt dark:bg-surface-alt-dark">
            <tr className="table-rowbg-surface-alt dark:bg-surface-alt-dark">
              <th className="relative group select-none px-3 md:px-4 py-3 text-left text-xs font-medium text-primary-text dark:text-primary-text-dark uppercase cursor-pointer hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors">
                {multiupHistoryT('columns.fileName')}
              </th>
              <th className="relative group select-none px-3 md:px-4 py-3 text-left text-xs font-medium text-primary-text dark:text-primary-text-dark uppercase cursor-pointer hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors">
                {multiupHistoryT('columns.size')}
              </th>
              <th className="relative group select-none px-3 md:px-4 py-3 text-left text-xs font-medium text-primary-text dark:text-primary-text-dark uppercase cursor-pointer hover:bg-surface-hover dark:hover:bg-surface-hover-dark transition-colors">
                {multiupHistoryT('columns.createdAt')}
              </th>
              <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-primary-text dark:text-primary-text-dark uppercase sticky right-0 bg-surface-alt dark:bg-surface-alt-dark w-[100px] min-w-[100px] max-w-[150px]">
                {multiupHistoryT('columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface dark:bg-surface-dark divide-y divide-border dark:divide-border-dark">
            {history.map((item, index) => (
              <tr
                key={index}
                className="bg-surface hover:bg-surface-alt-hover dark:bg-surface-dark dark:hover:bg-surface-alt-hover-dark"
              >
                <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm text-primary-text/70 dark:text-primary-text-dark/70 max-w-[300px] overflow-hidden text-ellipsis">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10">
                      <Icons.CloudUpload className="w-4 h-4" />
                    </div>
                    <span className="truncate" title={item.fileName}>
                      {item.fileName}
                    </span>
                  </div>
                </td>
                <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm text-primary-text/70 dark:text-primary-text-dark/70">
                  {formatFileSize(item.size)}
                </td>
                <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm text-primary-text/70 dark:text-primary-text-dark/70">
                  {getCreatedDate(item.createdAt)}
                </td>
                <td
                  className={`px-3 md:px-4 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 z-10 bg-inherit dark:bg-inherit flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-end gap-2`}
                >
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className={`p-1.5 rounded-full text-accent dark:text-accent-dark 
                      hover:bg-accent/5 dark:hover:bg-accent-dark/5 transition-colors
                      ${isMobile ? 'w-full flex items-center justify-center py-1 rounded-md' : ''}`}
                    title={multiupHistoryT('actions.copy')}
                  >
                    {isMobile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Icons.Copy /> {multiupHistoryT('actions.copy')}
                      </div>
                    ) : (
                      <Icons.Copy />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(item.url, '_blank')}
                    className={`p-1.5 rounded-full text-accent dark:text-accent-dark 
                      hover:bg-accent/5 dark:hover:bg-accent-dark/5 transition-colors
                      ${isMobile ? 'w-full flex items-center justify-center py-1 rounded-md' : ''}`}
                    title={multiupHistoryT('actions.open')}
                  >
                    {isMobile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Icons.ExternalLink /> {multiupHistoryT('actions.open')}
                      </div>
                    ) : (
                      <Icons.ExternalLink />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className={`p-1.5 rounded-full text-red-500 dark:text-red-400 
                      hover:bg-red-500/5 dark:hover:bg-red-400/5 transition-all duration-200
                      disabled:opacity-50 ${isMobile ? 'w-full flex items-center justify-center py-1 rounded-md' : ''}`}
                    title={multiupHistoryT('actions.remove')}
                  >
                    {isMobile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Icons.Times /> {multiupHistoryT('actions.remove')}
                      </div>
                    ) : (
                      <Icons.Times />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MultiupHistory;
