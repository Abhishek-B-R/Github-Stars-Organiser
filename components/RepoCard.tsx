import React from 'react';
import { Repo, Category } from '../types';

interface RepoCardProps {
  repo: Repo;
  category?: Category;
  onEdit: (repo: Repo) => void;
  onDelete: (repoId: string) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, category, onEdit, onDelete }) => {
  return (
    <div className="bg-github-panel border border-github-border rounded-md p-4 hover:border-github-muted transition-colors group relative">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <i className="fa-regular fa-bookmark text-github-muted"></i>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 font-semibold text-lg hover:underline truncate max-w-[200px] sm:max-w-md"
          >
            {repo.owner}/<span className="font-bold text-white">{repo.name}</span>
          </a>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(repo)}
            className="text-github-muted hover:text-blue-400 p-1"
            title="Edit Category"
          >
            <i className="fa-solid fa-pen"></i>
          </button>
          <button
            onClick={() => onDelete(repo.id)}
            className="text-github-muted hover:text-red-400 p-1"
            title="Untrack Star"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <p className="text-github-text text-sm mb-4 line-clamp-2 min-h-[40px]">
        {repo.description || "No description provided."}
      </p>

      <div className="flex justify-between items-center text-xs text-github-muted mt-auto">
        <div className="flex items-center gap-4">
          {repo.language && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              {repo.language}
            </div>
          )}
          <div className="flex items-center gap-1">
            <i className="fa-regular fa-star"></i>
            {repo.stars.toLocaleString()}
          </div>
        </div>

        {category ? (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `${category.color}20`, // 20% opacity
              color: category.color,
              borderColor: `${category.color}40`
            }}
          >
            {category.name}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
            Uncategorized
          </span>
        )}
      </div>
    </div>
  );
};
