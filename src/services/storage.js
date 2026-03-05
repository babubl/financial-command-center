// ─── Storage Service ───
// Handles localStorage read/write/export/import with error handling.

const STORAGE_KEY = 'fcc_financial_data';
const STORAGE_VERSION = 1;

/**
 * Save financial data to localStorage
 */
export const saveToStorage = (data) => {
  try {
    const wrapped = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapped));
    return true;
  } catch (err) {
    console.error('Storage save failed:', err);
    return false;
  }
};

/**
 * Load financial data from localStorage
 * Returns null if nothing saved
 */
export const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Version check — future migration can go here
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, resetting.');
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.error('Storage load failed:', err);
    return null;
  }
};

/**
 * Clear all stored data
 */
export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Storage clear failed:', err);
    return false;
  }
};

/**
 * Export data as downloadable JSON file
 */
export const exportData = (data) => {
  try {
    const exportPayload = {
      appName: 'Financial Command Center',
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fcc-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Export failed:', err);
    return false;
  }
};

/**
 * Import data from a JSON file
 * @param {File} file - The uploaded JSON file
 * @returns {Promise<Object|null>} Parsed data or null
 */
export const importData = (file) => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.appName === 'Financial Command Center' && parsed.data) {
            resolve(parsed.data);
          } else {
            console.error('Invalid import file format');
            resolve(null);
          }
        } catch {
          console.error('JSON parse failed');
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    } catch {
      resolve(null);
    }
  });
};

/**
 * Get the last saved timestamp
 */
export const getLastSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.updatedAt || null;
  } catch {
    return null;
  }
};
