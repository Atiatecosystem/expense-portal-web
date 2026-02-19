import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (v: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }[];
  children?: React.ReactNode;
}

/** Reusable search + filter bar used across admin tables */
const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  children,
}: FilterBarProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
    {filters.map((filter, i) => (
      <Select key={i} value={filter.value} onValueChange={filter.onChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={filter.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filter.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ))}
    {children}
  </div>
);

export default FilterBar;
