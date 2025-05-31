import { Button } from "~/components/ui/button";
import { SearchIcon } from "lucide-react";
import { type SearchMode } from "~/lib/models";

interface SearchModeToggleProps {
  value: SearchMode;
  onChange: (value: SearchMode) => void;
  disabled?: boolean;
}

export function SearchModeToggle({
  value,
  onChange,
  disabled,
}: SearchModeToggleProps) {

  const handleClick = () => {
    const modes: SearchMode[] = ["on", "off"];
    const currentIndex = modes.indexOf(value);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % modes.length;
    onChange(modes[nextIndex]!);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`bg-muted px-2 flex min-w-fit h-fit rounded-xl py-1.5 gap-1 hover:bg-muted-foreground/10 ${(value !== "off") && "bg-muted-foreground/10"}`}
      onClick={handleClick}
      disabled={disabled}
      title={`Search mode: ${value}`}
    >
      <SearchIcon className="w-4 text-muted-foreground" style={{ opacity: value === "off" ? 0.3 : 1 }} />
      <span className="font-normal text-xs text-muted-foreground" style={{ opacity: value === "off" ? 0.5 : 1 }}>Search</span>
    </Button>
  );
} 