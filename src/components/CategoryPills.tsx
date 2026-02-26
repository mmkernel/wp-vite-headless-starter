import { Link } from "react-router-dom";
import { WPCategory } from "../services/wp";

const CategoryPills = ({ categories }: { categories: WPCategory[] }) => (
  <div className="flex flex-wrap gap-2">
    {categories.map((cat) => (
      <Link
        key={cat.id}
        to={`/category/${cat.slug}`}
        className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700 hover:bg-slate-200"
      >
        {cat.name}
      </Link>
    ))}
  </div>
);

export default CategoryPills;
