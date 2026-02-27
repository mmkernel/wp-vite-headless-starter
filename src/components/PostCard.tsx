import { Link } from "react-router-dom";
import { WPPost, getFeaturedMediaUrl, getAuthorName, getCategoryObjects } from "../services/wp";

const ALLOWED_TAGS = ["EM", "STRONG", "P", "BR"];

const sanitizeExcerpt = (html: string) => {
  if (typeof window === "undefined") return html;

  const container = window.document.createElement("div");
  container.innerHTML = html;

  container.querySelectorAll("*").forEach((el) => {
    if (!ALLOWED_TAGS.includes(el.tagName)) {
      const text = window.document.createTextNode(el.textContent ?? "");
      el.replaceWith(text);
      return;
    }

    // strip attributes from allowed tags
    Array.from(el.attributes).forEach((attr) => el.removeAttribute(attr.name));
  });

  return container.innerHTML;
};

const PostCard = ({ post }: { post: WPPost }) => {
  const image = getFeaturedMediaUrl(post);
  const author = getAuthorName(post);
  const categories = getCategoryObjects(post);
  const cleanExcerpt = sanitizeExcerpt(post.excerpt.rendered);

  return (
    <article className="card overflow-hidden flex flex-col h-full">
      {image && <img src={image} alt={post.title.rendered} loading="lazy" className="h-48 w-full object-cover" />}
      <div className="p-6 flex-1 flex flex-col gap-3">
        <div className="text-xs text-slate-500 flex flex-wrap gap-2">
          <span>{new Date(post.date).toLocaleDateString()}</span>
          {author && <span>by {author}</span>}
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
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
