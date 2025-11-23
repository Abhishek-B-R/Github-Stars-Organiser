// This file represents the logic that runs on GitHub's pages.
// In a real build pipeline, this would be bundled into 'content.js'.

// To keep the example complete, this file shows how we detect clicks 
// and inject the React Root for the modal.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CategorizeDialog } from '../components/CategorizeDialog';
import { DEFAULT_CATEGORIES } from '../constants';

console.log("StarGazer Content Script Loaded");

// Helper to extract repo data from DOM
const getRepoData = () => {
  const ownerEl = document.querySelector('span.author a');
  const nameEl = document.querySelector('strong[itemprop="name"] a');
  const descEl = document.querySelector('p.f4'); // GitHub's desc class often varies, simplistic selector
  
  const owner = ownerEl?.textContent?.trim() || '';
  const name = nameEl?.textContent?.trim() || '';
  
  return {
    id: `${owner}/${name}`,
    owner,
    name,
    description: descEl?.textContent?.trim() || '',
    url: window.location.href,
    stars: 0
  };
};

const injectDialog = (initialRepoData: any) => {
  const hostDiv = document.createElement('div');
  hostDiv.id = 'stargazer-overlay-root';
  document.body.appendChild(hostDiv);

  const root = createRoot(hostDiv);

  const closeDialog = () => {
    root.unmount();
    hostDiv.remove();
  };

  const handleSave = (repo: any, cat: any) => {
    // In a real extension, we message the background script to save
    console.log("Saving to chrome storage via background...", repo, cat);
    // chrome.runtime.sendMessage({ type: 'SAVE_REPO', payload: { repo, category: cat } });
  };

  // We mock categories here, but would load from storage in reality
  root.render(
    <CategorizeDialog
      isOpen={true}
      onClose={closeDialog}
      repo={initialRepoData}
      categories={DEFAULT_CATEGORIES} // Should fetch fresh categories
      onSave={handleSave}
    />
  );
};

// Observer to attach listener to Star button (since GitHub is an SPA)
const observeDOM = () => {
  const observer = new MutationObserver(() => {
    const starBtn = document.querySelector('.starred-button') || document.querySelector('.js-toggler-target[aria-label="Unstar this repository"]');
    // Note: GitHub selectors change often. We target the specific star container.
    // For this example, we'll assume a standard button class or aria-label logic.
    
    // Simplification for the example: Find the button that SAYS "Star" (unstarred state)
    const buttons = Array.from(document.querySelectorAll('button'));
    const actualStarBtn = buttons.find(b => b.textContent?.includes('Star') && !b.textContent?.includes('Unstar'));

    if (actualStarBtn && !actualStarBtn.hasAttribute('data-stargazer-attached')) {
      actualStarBtn.setAttribute('data-stargazer-attached', 'true');
      actualStarBtn.addEventListener('click', (e) => {
        // Wait a split second for GitHub's internal logic
        setTimeout(() => {
            const data = getRepoData();
            injectDialog(data);
        }, 500);
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

// Start observing
observeDOM();
