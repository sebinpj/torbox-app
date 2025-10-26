// Multiup history management utilities
const MULTIUP_HISTORY_KEY = 'torboxMultiupHistory';

export const getMultiupHistory = () => {
  const history = localStorage.getItem(MULTIUP_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const addToMultiupHistory = (linkData) => {
  const history = getMultiupHistory();
  
  // Create a unique ID for the link
  const id = `multiup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const historyItem = {
    id,
    url: linkData.link,
    fileName: linkData.fileName,
    size: linkData.size,
    originalUrl: linkData.originalUrl,
    originalName: linkData.originalName,
    createdAt: new Date().toISOString(),
    type: 'multiup'
  };
  
  history.unshift(historyItem);
  
  // Keep only last 200 entries
  const trimmedHistory = history.slice(0, 200);
  localStorage.setItem(MULTIUP_HISTORY_KEY, JSON.stringify(trimmedHistory));
  
  return historyItem;
};

export const removeFromMultiupHistory = (id) => {
  const history = getMultiupHistory();
  const newHistory = history.filter((item) => item.id !== id);
  localStorage.setItem(MULTIUP_HISTORY_KEY, JSON.stringify(newHistory));
  return newHistory;
};

export const clearMultiupHistory = () => {
  localStorage.removeItem(MULTIUP_HISTORY_KEY);
};
