import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ALL = "__all__";

export function SelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="min-w-[9rem] flex-1 sm:flex-none">
      <Label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-8 w-full sm:w-[11rem]">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Debounced search input — avoids refiltering on every keystroke. */
export function SearchFilter({
  label = "Search",
  placeholder,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [raw, setRaw] = useState("");
  useEffect(() => {
    const t = setTimeout(() => onChange(raw.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [raw, onChange]);

  return (
    <div className="min-w-[12rem] flex-1">
      <Label htmlFor="admin-search" className="mb-1 block text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="admin-search"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="h-8 pl-8"
        />
      </div>
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
      {children}
    </div>
  );
}
