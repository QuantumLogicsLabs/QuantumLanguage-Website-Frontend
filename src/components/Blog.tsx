import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogs, BlogPost } from '../data/blogs';

/**
 * Returns 3 featured blogs:
 * - Slot 1: Always spotlights the newest / most recently published blog post.
 * - Slots 2 & 3: Uses a date-seeded PRNG (Mulberry32) to randomly pick and shuffle 2 blogs from all remaining archive articles every midnight.
 */
function getDailyFeaturedBlogs(allBlogs: BlogPost[], count: number = 3): BlogPost[] {
  if (allBlogs.length === 0) return [];
  if (allBlogs.length <= count) return allBlogs;

  // 1. Slot 1: Always pick the newest post (last item in array)
  const latestPost = allBlogs[allBlogs.length - 1];
  const remainingBlogs = allBlogs.slice(0, allBlogs.length - 1);

  // 2. Slots 2 & 3: Date-seeded PRNG random shuffle of remaining archive posts
  const todayStr = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < todayStr.length; i++) {
    seed = (seed << 5) - seed + todayStr.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed);

  const seededRandom = () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffled = [...remainingBlogs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const archivePicked = shuffled.slice(0, count - 1);
  return [latestPost, ...archivePicked];
}

export const Blog = () => {
  // Selects 3 daily featured posts (1 latest + 2 daily shuffled archive posts)
  const latestPosts = useMemo(() => getDailyFeaturedBlogs(blogs, 3), []);

  return (
    <section id="blog" className="py-32 bg-white dark:bg-black transition-colors duration-300 border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      {/* Background visual element */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight mb-4 uppercase">
              Latest from the Lab
            </h2>
            <p className="text-black/50 dark:text-white/50 max-w-2xl text-base leading-relaxed">
              Deep dives into language internals, performance tips, engineering updates, and tutorials from the Quantum Logics team.
            </p>
          </div>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all duration-300 group"
          >
            View All Posts <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link 
                to={`/blog/${post.slug}`}
                className="group block h-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-2 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-black/5 dark:bg-white/5">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      {post.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-black/40 dark:text-white/40 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-black/60 dark:text-white/60 text-sm line-clamp-3 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 group-hover:gap-3 transition-all duration-300">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
