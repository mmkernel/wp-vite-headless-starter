import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { WPPost, getFeaturedMediaUrl, getAuthorName, getCategoryObjects } from "../services/wp";

const PostCard = ({ post }: { post: WPPost }) => {
  const image = getFeaturedMediaUrl(post);
  const author = getAuthorName(post);
  const categories = getCategoryObjects(post);
  const cleanExcerpt =
    typeof window !== "undefined"
      ? DOMPurify.sanitize(post.excerpt.rendered, { ALLOWED_TAGS: ["em", "strong", "p", "br"] })
      : post.excerpt.rendered;

  return (
    <article className="card overflow-hidden flex flex-col h-full">
      {image && <img src={image} alt={post.title.rendered} loading="lazy" className="h-48 w-full object-cover" />}
      <div className="p-6 flex-1 flex flex-col gap-3">
        <div className="text-xs text-slate-500 flex flex-wrap gap-2">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          {author && <span>• {author}</span>}
          {categories.map((cat) => (
            <span key={cat.id} className="px-2 py-1 bg-slate-100 rounded-full">
              {cat.name}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold">
          <Link to={`/blog/${post.slug}`} className="hover:text-blue-700 transition-colors">
            {post.title.rendered}
          </Link>
        </h3>
        <div className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: cleanExcerpt }} />
        <div className="mt-auto pt-3">
          <Link to={`/blog/${post.slug}`} className="text-blue-700 hover:text-blue-800 text-sm">
            Read more ?
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
