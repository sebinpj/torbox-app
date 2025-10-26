import { useState, useEffect } from 'react';
import Icons from '@/components/icons';

export default function MultiupCredentialsManager({ onCredentialsSelect, activeCredentials, onClose }) {
  const [credentials, setCredentials] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCredLabel, setNewCredLabel] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    const storedCredentials = localStorage.getItem('multiupCredentials');
    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
    }
  }, []);

  const saveCredentials = (newCredentials) => {
    localStorage.setItem('multiupCredentials', JSON.stringify(newCredentials));
    setCredentials(newCredentials);
  };

  const addCredentials = () => {
    if (!newCredLabel || !newUsername || !newPassword) return;
    const newCred = { 
      label: newCredLabel, 
      username: newUsername, 
      password: newPassword 
    };
    const newCredentials = [...credentials, newCred];
    saveCredentials(newCredentials);
    setNewCredLabel('');
    setNewUsername('');
    setNewPassword('');
    setShowAddForm(false);
  };

  const deleteCredentials = (index) => {
    const newCredentials = credentials.filter((_, i) => i !== index);
    saveCredentials(newCredentials);
  };

  return (
    <div className="bg-surface-alt dark:bg-surface-alt-dark rounded-lg border border-border dark:border-border-dark p-4
      max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-text dark:text-primary-text-dark">
          Multiup Credentials
        </h3>
        <button
          onClick={onClose}
          className="text-primary-text/50 dark:text-primary-text-dark/50 hover:text-primary-text 
          dark:hover:text-primary-text-dark transition-colors p-1"
        >
          <Icons.Times className="w-5 h-5" />
        </button>
      </div>

      {/* Existing credentials */}
      <div className="space-y-2 mb-4">
        {credentials.map((cred, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              activeCredentials?.label === cred.label
                ? 'border-accent bg-accent/5 dark:border-accent-dark dark:bg-accent-dark/5'
                : 'border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark'
            }`}
            onClick={() => onCredentialsSelect(cred)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-primary-text dark:text-primary-text-dark">
                  {cred.label}
                </div>
                <div className="text-sm text-primary-text/70 dark:text-primary-text-dark/70">
                  {cred.username}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCredentials(index);
                }}
                className="text-red-500 hover:text-red-600 transition-colors p-1"
              >
                <Icons.Delete className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new credentials */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border-2 border-dashed border-border dark:border-border-dark 
          rounded-lg text-primary-text/70 dark:text-primary-text-dark/70 
          hover:text-primary-text dark:hover:text-primary-text-dark 
          hover:border-accent dark:hover:border-accent-dark transition-colors
          flex items-center justify-center gap-2"
        >
          <Icons.Plus className="w-5 h-5" />
          Add New Credentials
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-text dark:text-primary-text-dark">
              Label
            </label>
            <input
              type="text"
              value={newCredLabel}
              onChange={(e) => setNewCredLabel(e.target.value)}
              placeholder="e.g., My Multiup Account"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg
                bg-transparent text-primary-text dark:text-primary-text-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-text dark:text-primary-text-dark">
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Multiup username"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg
                bg-transparent text-primary-text dark:text-primary-text-dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-primary-text dark:text-primary-text-dark">
              Password
            </label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Multiup password"
                className="w-full px-3 py-2 pr-10 border border-border dark:border-border-dark rounded-lg
                  bg-transparent text-primary-text dark:text-primary-text-dark"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-text/50 
                  dark:text-primary-text-dark/50 hover:text-primary-text 
                  dark:hover:text-primary-text-dark transition-colors p-1"
              >
                {showPasswords ? <Icons.Eye /> : <Icons.EyeOff />}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCredLabel('');
                setNewUsername('');
                setNewPassword('');
              }}
              className="px-4 py-2 text-sm text-primary-text/70 dark:text-primary-text-dark/70 
              hover:text-primary-text dark:hover:text-primary-text-dark"
            >
              Cancel
            </button>
            <button
              onClick={addCredentials}
              className="px-4 py-2 text-sm bg-accent text-white rounded hover:bg-accent/90 
              transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
