"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { DashboardFilters, LocationFilter, ApiFilters } from "@/lib/types";

interface FilterBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  apiFilters: ApiFilters;
  onApiFilterChange: (filters: ApiFilters) => void;
  onSearch: () => void;
  totalJobs: number;
  filteredCount: number;
}

export function FilterBar({
  filters,
  onChange,
  apiFilters,
  onApiFilterChange,
  onSearch,
  totalJobs,
  filteredCount,
}: FilterBarProps) {
  return (
    <div className="sticky top-16 z-40 glass-card rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Filters</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {filteredCount} of {totalJobs} jobs
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        {/* Source Data Filters (Triggers Re-fetch) */}
        <div className="flex flex-col sm:flex-row items-end gap-4 pb-4 border-b border-border/50">
          <div className="flex-1 w-full">
            <span className="text-xs text-muted-foreground mb-1 block">Job Domain / Type</span>
            <Select
              value={apiFilters.jobType}
              onValueChange={(val) => onApiFilterChange({ ...apiFilters, jobType: val || "" })}
            >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Job Domain / Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Domains">All Domains</SelectItem>
              <SelectItem value="Software">Software & IT</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Services">Services</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
            </SelectContent>
            </Select>
          </div>

          <div className="flex-1 w-full">
            <span className="text-xs text-muted-foreground mb-1 block">Country</span>
            <Select
              value={apiFilters.country}
              onValueChange={(val) => onApiFilterChange({ ...apiFilters, country: val || "" })}
            >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Worldwide">Worldwide</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="Singapore">Singapore</SelectItem>
            </SelectContent>
            </Select>
          </div>
          
          <Button onClick={onSearch} className="w-full sm:w-auto h-9 px-6 gradient-btn text-white">
            Search Jobs
          </Button>
        </div>

        {/* Local Display Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="keyword-search"
            placeholder="Search jobs..."
            value={filters.keyword}
            onChange={(e) =>
              onChange({ ...filters, keyword: e.target.value })
            }
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>

        {/* Location Filter */}
        <Select
          value={filters.location}
          onValueChange={(value: string | null) => {
            if (value) onChange({ ...filters, location: value as LocationFilter });
          }}
        >
          <SelectTrigger id="location-filter" className="bg-background/50 border-border/50">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="remote">Remote Only</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        {/* Min Score Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Min Score
          </span>
          <Slider
            id="min-score-slider"
            value={[filters.minScore]}
            onValueChange={(value: number | readonly number[]) => {
              const val = Array.isArray(value) || value instanceof Array ? value[0] : (value as number);
              onChange({ ...filters, minScore: val });
            }}
            min={0}
            max={100}
            step={5}
            className="flex-1"
          />
          <Badge
            variant="outline"
            className="min-w-[3rem] justify-center text-xs font-mono"
          >
            {filters.minScore}%
          </Badge>
        </div>
      </div>
      </div>
    </div>
  );
}
