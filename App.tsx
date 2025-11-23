import React, { useState, useEffect, useMemo } from 'react';
import { Repo, Category, StarGazerState } from './types';
import { loadState, saveState } from './services/storage';
import { RepoCard } from './components/RepoCard';
import { CategorizeDialog } from './components/CategorizeDialog';

function App() {
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<Partial<Repo> | null>(null);

  useEffect(() => {
    const init = async () => {
      const data: StarGazerState = await loadState();
      setRepos(data.repos);
      setCategories(data.categories);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveState({ repos, categories });
    }
  }, [repos, categories, loading]);

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeFilter === 'all' || repo.categoryId === activeFilter;

      return matchesSearch && matchesCategory;
    });
  }, [repos, searchQuery, activeFilter]);

  const handleEditRepo = (repo: Repo) => {
    setEditingRepo(repo);
    setIsDialogOpen(true);
  };

  const handleDeleteRepo = (repoId: string) => {
    if (confirm('Are you sure you want to stop tracking this repo?')) {
      setRepos((prev) => prev.filter((r) => r.id !== repoId));
    }
  };

  const handleSaveRepo = (updatedRepo: Repo, newCategory?: Category) => {
    if (newCategory) {
      setCategories((prev) => [...prev, newCategory]);
    }
    
    setRepos((prev) => {
      const exists = prev.find(r => r.id === updatedRepo.id);
      if (exists) {
        return prev.map(r => r.id === updatedRepo.id ? updatedRepo : r);
      }
      return [updatedRepo, ...prev];
    });
  };

  const handleSimulateStar = () => {
    // Simulating a repo click from GitHub
    const mockRepo: Partial<Repo> = {
      id: `simulated/repo-${Date.now()}`,
      owner: 'simulated',
      name: `awesome-project-${Math.floor(Math.random() * 100)}`,
      description: 'An amazing project that does incredible things with AI and React.',
      stars: Math.floor(Math.random() * 5000) + 100,
      language: 'TypeScript',
      url: '#'
    };
    setEditingRepo(mockRepo);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-github-text">
        <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-github-text font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation */}
      <nav className="border-b border-github-border bg-[#161b22] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-lg font-bold">
                <i className="fa-solid fa-star"></i>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">StarGazer</span>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Simulation Button for Web Preview */}
               <button 
                onClick={handleSimulateStar}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 text-sm font-medium transition-colors"
              >
                <i className="fa-solid fa-robot"></i> Simulate "Star" Click
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-github-muted uppercase mb-3 px-2">Filters</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    activeFilter === 'all' ? 'bg-github-btn text-white' : 'text-github-text hover:bg-github-btn/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-layer-group"></i> All Stars
                  </span>
                  <span className="bg-github-border text-xs px-2 py-0.5 rounded-full">{repos.length}</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-github-muted uppercase mb-3 px-2 flex justify-between items-center">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      activeFilter === cat.id ? 'bg-github-btn text-white' : 'text-github-text hover:bg-github-btn/50'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="truncate flex-1 text-left">{cat.name}</span>
                    <span className="text-xs text-github-muted opacity-50">
                      {repos.filter(r => r.categoryId === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-github-muted"></i>
              <input
                type="text"
                placeholder="Search repositories, descriptions, or owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-github-border rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            {/* Grid */}
            {filteredRepos.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-github-border rounded-lg">
                <i className="fa-regular fa-folder-open text-4xl text-github-muted mb-4"></i>
                <h3 className="text-lg font-medium text-white">No repositories found</h3>
                <p className="text-github-muted">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepos.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    category={categories.find(c => c.id === repo.categoryId)}
                    onEdit={handleEditRepo}
                    onDelete={handleDeleteRepo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categorize Modal (Shared for both Simulation and Edit) */}
      {editingRepo && (
        <CategorizeDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          repo={editingRepo}
          categories={categories}
          onSave={handleSaveRepo}
        />
      )}
    </div>
  );
}

export default App;
