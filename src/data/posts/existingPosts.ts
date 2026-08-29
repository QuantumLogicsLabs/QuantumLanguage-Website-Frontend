import { BlogPost } from '../blogs';

export const existingPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "under-the-hood-quantum-compiler-pipeline",
    title: "Syntax without Borders: The Quantum Language Blueprint",
    category: "Language Guide",
    author: "Core Compiler Team",
    date: "July 12, 2026",
    readingTime: "3 min read",
    coverImage: "/languages.png",
    excerpt: "From Pythonic indentation to C-style pointers and streams—discover how Quantum combines the best parts of your favorite languages into a single unified runtime environment.",
    content: [
      {
        type: "paragraph",
        value: "The fundamental philosophy behind Quantum source files (`.sa`) is simple: **you shouldn't have to change how you think just to write a script.** Instead of forcing a rigid framework, the Quantum compiler blends layouts dynamically, letting you mix Pythonic elegance, JavaScript flexibility, and low-level C control within the exact same file scope."
      },
      {
        type: "heading",
        value: { level: 2, text: "1. The Multi-Syntax Engine" }
      },
      {
        type: "paragraph",
        value: "At the parser level, Quantum bridges different structural layouts seamlessly. Look at how you can express a standard conditional check using three entirely different syntax conventions concurrently:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `# Style 1: Pythonic style layout
if x > 0:
    print("positive")

# Style 2: Standard block structure
if x > 0 { print("positive") }

# Style 3: Traditional C-Style system layout
if(x > 0) { printf("%d\\n", x) }`
        }
      }
    ]
  },
  {
    id: "post-2",
    slug: "understanding-quantum-vs-qrun",
    title: "Inside the Toolchain: quantum vs. qrun",
    category: "Architecture",
    author: "Toolchain Engineer",
    date: "July 05, 2026",
    readingTime: "5 min read",
    coverImage: "/quantumBinary.png",
    excerpt: "Ever wondered why Quantum has two binaries? Let's break down the difference between the compiler (quantum) and the runtime (qrun), and how they manage bytecode.",
    content: [
      {
        type: "paragraph",
        value: "When you install Quantum, you aren't just getting a language—you're getting an ecosystem. At the heart of this ecosystem are two distinct binaries: **quantum** and **qrun**."
      }
    ]
  },
  {
    id: "post-3",
    slug: "quantum-standard-library",
    title: "Inside the Quantum Standard Library",
    category: "Standard Library",
    author: "Core Engine Team",
    date: "July 13, 2026",
    readingTime: "4 min read",
    coverImage: "/standard_library.png",
    excerpt: "From cryptographic hashes and timing-safe checks to CIDR subnet parsers and raw hex encoding, explore Quantum's massive built-in standard library.",
    content: [
      {
        type: "paragraph",
        value: "A great language isn't just defined by its syntax—it is defined by what you can build on day one without installing third-party dependencies."
      }
    ]
  }
];
