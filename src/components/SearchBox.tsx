import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SearchBox = ({ compact = false }: { compact?: boolean }) => {
  const [params] = useSearchParams();
  const initial = params.get("q") || "";
  const [term, setTerm] = useState(initial);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <form onSubmit={onSubmit} className={compact ? "w-full" : "w-64"} role="search" aria-label="Search posts">
      <div className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-2 bg-white shadow-sm">
        <input
          aria-label="Search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search blog"
          className="flex-1 outline-none text-sm bg-transparent"
          type="search"
        />
        <button type="submit" className="text-sm text-blue-700 hover:text-blue-800">Go</button>
      </div>
    </form>
  );
};

export default SearchBox;
