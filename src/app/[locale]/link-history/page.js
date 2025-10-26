'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LinkHistory from '@/components/LinkHistory';
import MultiupHistory from '@/components/MultiupHistory';
import { getMultiupHistory, removeFromMultiupHistory } from '@/utils/multiupHistory';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function LinkHistoryPage() {
  const [history, setHistory] = useState([]);
  const [multiupHistory, setMultiupHistory] = useState([]);

  useEffect(() => {
    const downloadHistory = JSON.parse(
      localStorage.getItem('torboxDownloadHistory') || '[]',
    );
    const multiupLinks = getMultiupHistory();

    setHistory(downloadHistory);
    setMultiupHistory(multiupLinks);
  }, []);

  const deleteHistoryItem = (id) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('torboxDownloadHistory', JSON.stringify(newHistory));
  };

  const deleteMultiupItem = (id) => {
    const newHistory = removeFromMultiupHistory(id);
    setMultiupHistory(newHistory);
  };

  return (
    <main
      className={`min-h-screen bg-surface dark:bg-surface-dark ${inter.variable} font-sans`}
    >
      <Header />
      <div className="container mx-auto p-4">
        <LinkHistory history={history} onDelete={deleteHistoryItem} />
        <div className="mt-8">
          <MultiupHistory history={multiupHistory} onDelete={deleteMultiupItem} />
        </div>
      </div>
    </main>
  );
}
