import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogs } from '../data/blogs';

export const Blog = () => {
 // Reverses the array to pick the 3 newest additions first!
const latestPosts = [...blogs].reverse().slice(0, 3);

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
                  {/* Featured Image */}
                  <div className="aspect-[16/10] bg-black/5 dark:bg-white/5 rounded-2xl mb-6 overflow-hidden border border-black/5 dark:border-white/5 relative">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Badges & Meta */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 border border-black/5 dark:border-white/10">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-black/30 dark:text-white/30 font-semibold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readingTime}</span>
                    </div>
                  </div>

                  <div className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-widest mb-3">
                    {post.date}
                  </div>

                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors duration-300 leading-tight">
                    {post.title}
                  </h3>

                  <p className="text-black/50 dark:text-white/50 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/80 dark:text-white/80 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors duration-300">
                  Read Article 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
