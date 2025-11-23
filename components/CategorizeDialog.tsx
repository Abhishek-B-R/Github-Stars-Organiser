import React, { useState, useEffect } from 'react';
import { Category, Repo } from '../types';
import { suggestCategoryForRepo } from '../services/geminiService';

interface CategorizeDialogProps {
  repo: Partial<Repo>;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (repo: Repo, newCategory?: Category) => void;
}

export const CategorizeDialog: React.FC<CategorizeDialogProps> = ({
  repo,
  categories,
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(repo.categoryId || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#58a6ff');
  const [isThinking, setIsThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(repo.categoryId || '');
      setIsCreatingNew(false);
      setNewCatName('');
      setAiSuggestion(null);
    }
  }, [isOpen, repo]);

  const handleAIAutoCategorize = async () => {
    if (!repo.name || !repo.description) return;
    setIsThinking(true);
    const suggestion = await suggestCategoryForRepo(repo.name, repo.description);
    setIsThinking(false);

    if (suggestion) {
      setAiSuggestion(suggestion.reasoning);
      // Check if category exists
      const existing = categories.find(c => c.name.toLowerCase() === suggestion.categoryName.toLowerCase());
      if (existing) {
        setSelectedCategoryId(existing.id);
        setIsCreatingNew(false);
      } else {
        setIsCreatingNew(true);
        setNewCatName(suggestion.categoryName);
        setNewCatColor(suggestion.colorHex);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let categoryIdToSave = selectedCategoryId;
    let newCategory: Category | undefined;

    if (isCreatingNew) {
      const newId = `cat_${Date.now()}`;
      newCategory = {
        id: newId,
        name: newCatName,
        color: newCatColor
      };
      categoryIdToSave = newId;
    }

    const updatedRepo: Repo = {
      id: repo.id || `${repo.owner}/${repo.name}`,
      owner: repo.owner || 'unknown',
      name: repo.name || 'unknown',
      description: repo.description || '',
      url: repo.url || '#',
      stars: repo.stars || 0,
      language: repo.language || null,
      categoryId: categoryIdToSave,
      starredAt: repo.starredAt || new Date().toISOString()
    };

    onSave(updatedRepo, newCategory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-github-panel border border-github-border rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-github-border flex justify-between items-center bg-github-dark">
          <h3 className="text-white font-semibold">
            <i className="fa-regular fa-star text-yellow-500 mr-2"></i>
            Categorize Repository
          </h3>
          <button onClick={onClose} className="text-github-muted hover:text-white">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-github-muted uppercase font-bold mb-1">Repository</label>
            <div className="text-white font-medium truncate">{repo.owner}/{repo.name}</div>
            <div className="text-xs text-github-muted mt-1 line-clamp-2">{repo.description}</div>
          </div>

          {!process.env.API_KEY ? null : (
             <div className="flex justify-end">
               <button
                 type="button"
                 onClick={handleAIAutoCategorize}
                 disabled={isThinking}
                 className="text-xs flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
               >
                 {isThinking ? (
                   <><i className="fa-solid fa-spinner fa-spin"></i> Analyzing...</>
                 ) : (
                   <><i className="fa-solid fa-wand-magic-sparkles"></i> AI Suggest Category</>
                 )}
               </button>
             </div>
          )}

          {aiSuggestion && (
             <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded text-xs text-purple-200">
               <span className="font-bold">Gemini:</span> {aiSuggestion}
             </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-github-muted uppercase font-bold">Select Category</label>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-xs text-blue-400 hover:underline"
              >
                {isCreatingNew ? 'Select existing' : 'Create new'}
              </button>
            </div>

            {isCreatingNew ? (
              <div className="space-y-3 p-3 bg-github-dark rounded border border-github-border">
                <div>
                  <label className="block text-xs text-github-text mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-github-btn border border-github-border rounded px-2 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Database"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-github-text mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="h-8 w-12 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-xs text-github-muted">{newCatColor}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`
                      flex items-center gap-2 p-2 rounded border text-left transition-all
                      ${selectedCategoryId === cat.id
                        ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-github-btn border-github-border hover:border-github-muted'}
                    `}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="text-sm text-github-text truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-2 px-4 rounded transition-colors flex justify-center items-center gap-2 mt-4"
          >
            <i className="fa-solid fa-check"></i> Save Star
          </button>
        </form>
      </div>
    </div>
  );
};
