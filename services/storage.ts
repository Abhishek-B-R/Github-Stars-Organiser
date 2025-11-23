import { StarGazerState, Category, Repo } from '../types';
import { DEFAULT_CATEGORIES, MOCK_REPOS } from '../constants';

declare var chrome: any;

const STORAGE_KEY = 'stargazer_data';

// Helper to check if we are in a Chrome Extension environment
const isExtension = () => {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
};

const getInitialState = (): StarGazerState => ({
  categories: DEFAULT_CATEGORIES,
  repos: MOCK_REPOS,
});

export const loadState = async (): Promise<StarGazerState> => {
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result: any) => {
        if (result[STORAGE_KEY]) {
          resolve(result[STORAGE_KEY]);
        } else {
          resolve(getInitialState());
        }
      });
    });
  } else {
    // Web Fallback
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return getInitialState();
  }
};

export const saveState = async (state: StarGazerState): Promise<void> => {
  if (isExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
        resolve();
      });
    });
  } else {
    // Web Fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return Promise.resolve();
  }
};