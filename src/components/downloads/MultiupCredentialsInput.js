'use client';

import { useState } from 'react';
import Icons from '@/components/icons';
import MultiupCredentialsManager from './MultiupCredentialsManager';

export default function MultiupCredentialsInput({
  credentials,
  onCredentialsChange,
  allowCredentialsManager = false,
}) {
  const [showManager, setShowManager] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative flex gap-2">
        <div className="flex-1">
          <div className="text-sm font-medium mb-1 text-primary-text dark:text-primary-text-dark">
            Multiup Account
          </div>
          <div className="text-sm text-primary-text/70 dark:text-primary-text-dark/70">
            {credentials?.label || 'No account selected'}
          </div>
        </div>

        {allowCredentialsManager && (
          <button
            onClick={() => setShowManager(!showManager)}
            className={`px-4 py-2 text-sm text-primary-text dark:text-primary-text-dark rounded-lg border border-border dark:border-border-dark
            hover:bg-surface-alt dark:hover:bg-surface-alt-dark transition-colors
            flex items-center gap-2 ${showManager ? 'bg-surface-alt dark:bg-surface-alt-dark' : ''}`}
            aria-label="Manage Multiup Credentials"
          >
            <Icons.Preferences className="w-4 h-4" />
            <span className="hidden md:inline">Manage</span>
          </button>
        )}
      </div>
      {showManager && (
        <MultiupCredentialsManager
          onCredentialsSelect={onCredentialsChange}
          activeCredentials={credentials}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
}
