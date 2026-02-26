interface Props {
  page: number;
  totalPages?: number;
  onChange: (page: number) => void;
}

const Pagination = ({ page, totalPages = 10, onChange }: Props) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        className="btn btn-outline"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Prev
      </button>
      <span className="text-sm text-slate-600">Page {page}</span>
      <button
        className="btn btn-outline"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
