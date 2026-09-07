import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { liveListFailureMessage } from "../../dashboard/apiMessage";
import { fetchBlogsList, snippet } from "../../dashboard/blogs/api";
import type { BlogPost } from "../../dashboard/blogs/types";
import BlogCard from "./BlogCard";

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchBlogsList({
        page: 1,
        pageSize: 12,
        search: "",
        title: "",
      });
      setPosts(payload.data);
    } catch (cause) {
      setPosts([]);
      setError(liveListFailureMessage(cause, "blog posts"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="flex flex-col mt-16 justify-center items-center mb-24 px-4 md:px-8">
      <motion.h1
        className="uppercase font-extrabold text-3xl md:text-4xl text-yellow-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Latest Blog Posts
      </motion.h1>

      <div className="w-24 h-1 bg-[#FFD700] rounded-full mb-12 mt-2"></div>

      {loading ? (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 w-full max-w-7xl">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-md bg-slate-200"
            />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-amber-900">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-[#0F3952] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => void load()}
          >
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <p className="max-w-xl text-center text-sm text-slate-500">
          No articles have been published yet.
        </p>
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 w-full max-w-7xl">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <BlogCard
                title={post.title}
                img={post.logo}
                detail={snippet(post.details, 140)}
                onReadMore={() => navigate(`/blogs/${post.id}`)}
              />
            </motion.div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Blog;
