export interface ProjectFabProps {
  onClick?: () => void;
}

export function ProjectFab({ onClick }: ProjectFabProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        type="button"
        onClick={onClick}
        className="group flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">
          add
        </span>
      </button>
    </div>
  );
}
