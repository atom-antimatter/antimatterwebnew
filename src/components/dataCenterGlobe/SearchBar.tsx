"use client";

import { useRef, useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder = "Search data centers…" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute top-6 left-6 z-10 flex gap-2 max-w-sm w-full"
      role="search"
      aria-label="Search data centers"
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-[rgba(246,246,253,0.05)] border border-[rgba(246,246,253,0.1)] text-[#f6f6fd] placeholder:text-[rgba(246,246,253,0.5)] focus:outline-none focus:border-[#696aac] focus:ring-1 focus:ring-[#696aac] transition-colors text-sm"
        aria-label="Search"
      />
      <button
        type="submit"
        className="h-11 px-5 rounded-xl font-medium text-sm text-[#f6f6fd] bg-[#696aac] hover:bg-[#8587e3] focus:outline-none focus:ring-2 focus:ring-[#696aac] focus:ring-offset-2 focus:ring-offset-[#020202] transition-colors shrink-0"
      >
        Search
      </button>
    </form>
  );
}
