"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

// Sub-components
import { ProjectItem } from "./management/ProjectItem";
import { ProjectCreationForm } from "./management/ProjectCreationForm";
import { EmptyState } from "./management/EmptyState";
import { ManagementFooter } from "./management/ManagementFooter";
import { ManagementHeader } from "./management/ManagementHeader";

// Hooks
import { useTranslationProjects } from "./management/useTranslationProjects";

interface ManagementViewProps {
  activeVersionId: string | null;
  onSelect: (id: string | null) => void;
  onBack?: () => void;
}

/**
 * components/reader/translations/ManagementView.tsx
 * Orchestrates the management of personal translation projects (Sovereignty Layer).
 * Refactored to use a custom hook for logic and sub-components for UI.
 */
export function ManagementView({
  activeVersionId,
  onSelect,
  onBack,
}: ManagementViewProps) {
  const {
    projects,
    loading,
    processingId,
    createProject,
    togglePublish,
    deleteProject,
  } = useTranslationProjects();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreateSubmit = async () => {
    await createProject(newName);
    setNewName("");
    setIsCreating(false);
  };

  const handleDeleteSubmit = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    )
      return;

    await deleteProject(id);
    if (activeVersionId === id) {
      onSelect(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ManagementHeader
        onBack={onBack}
        isCreating={isCreating}
        onCreateClick={() => setIsCreating(true)}
      />

      {/* Creation Modal */}
      {isCreating && (
        <ProjectCreationForm
          name={newName}
          setName={setNewName}
          onCancel={() => setIsCreating(false)}
          onSubmit={handleCreateSubmit}
          isProcessing={processingId === "create"}
        />
      )}

      {/* Project List */}
      <div className="space-y-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-pencil/40 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Loading Projects...
            </p>
          </div>
        ) : projects.length === 0 && !isCreating ? (
          <EmptyState onCreateClick={() => setIsCreating(true)} />
        ) : (
          projects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              isActive={activeVersionId === project.id}
              isProcessing={processingId === project.id}
              onSelect={onSelect}
              onTogglePublish={togglePublish}
              onDelete={handleDeleteSubmit}
            />
          ))
        )}
      </div>

      <ManagementFooter />
    </div>
  );
}
