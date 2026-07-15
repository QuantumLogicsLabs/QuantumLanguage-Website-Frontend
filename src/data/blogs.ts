export interface BlogBlock {
  type: 'paragraph' | 'heading' | 'code' | 'list' | 'blockquote' | 'table' | 'image';
  value: any;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readingTime: string;
  coverImage: string;
  excerpt: string;
  content: BlogBlock[];
}

export const blogs: BlogPost[] = [
  
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
      },
      {
        type: "heading",
        value: { level: 2, text: "2. Variables and Type Hints" }
      },
      {
        type: "paragraph",
        value: "Assignments are designed to feel natural whether you prefer loose scripting or explicit declarations. While Quantum remains entirely dynamically typed under the hood, the parser accepts native C-style type tags strictly as helpful inline hints for readability:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `name   = "Alice"               # Bare scripting assignment
let x  = 42                    # Quantum native keyword
const MAX = 100                # Constant tracking protection

int   count = 0                # C-style type hint (does not block runtime)
float pi    = 3.14
bool  flag  = false`
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "3. The Five Function Flavors" }
      },
      {
        type: "paragraph",
        value: "Functions are incredibly expressive. The front-end compiler maps five distinct block variations down into the exact same tree structure, meaning you can choose the layout that fits your immediate code pattern:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `fn add(a, b) { return a + b }           # 1. Quantum Native
def greet(name): return "Hi, " + name  # 2. Pythonic Block
function mul(a, b) { return a * b }    # 3. JavaScript Classic
double = (x) => x * 2                  # 4. Modern Arrow Form
square = fn(n) { return n * n }        # 5. Anonymous Expression`
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "4. Advanced Primitives: Pointers & I/O" }
      },
      {
        type: "paragraph",
        value: "Unlike typical high-level scripting environments, Quantum features first-class C-style pointer mechanics natively backed by underlying `std::shared_ptr` definitions. This allows you to perform direct references and dereferences safely:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `let x = 42
let p = &x        # Address-of: p holds a live reference to x
*p = 99           # Dereference + mutation assignment
print(x)          # Outputs: 99`
        }
      },
      {
        type: "paragraph",
        value: "To complete the hybrid ecosystem, the standard I/O library implements total streaming parity. You can stream parameters with standard print utilities or push bitwise left-shifts depending on your personal design preference:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `# Scripting output stream
print("hello", name)
printf("Score: %d / %d\\n", score, total)

# C++ style stream overloading handles piping flawlessly
cout << "Value: " << x << endl
cin >> name`
        }
      },
      {
        type: "blockquote",
        value: {
          text: "Whether you are catching language exceptions with try/catch blocks, managing functional closure scopes via stack-bound upvalues, or processing low-level bitwise operations, the .sa file environment adapts seamlessly to your workflow.",
          cite: "Quantum Core Spec"
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
        value: "When you install Quantum, you aren't just getting a language—you're getting an ecosystem. At the heart of this ecosystem are two distinct binaries: **quantum** and **qrun**. While they share the same DNA, they solve completely different problems."
      },
      {
        type: "heading",
        value: { level: 2, text: "The Binary Breakdown" }
      },
      {
        type: "paragraph",
        value: "Think of `quantum` as your build tool, and `qrun` as your execution environment. Here is how they stack up:"
      },
      {
        type: "table",
        value: {
          headers: ["Feature", "quantum (Compiler)", "qrun (VM Runtime)"],
          rows: [
            ["Primary Task", "Parsing & Bundling", "Execution & Interpretation"],
            ["Output", "Binary Executable (.exe)", "Live Runtime Process"],
            ["Workflow", "Compilation Pipeline", "Memory-only execution"],
            ["Dependency", "Needs Source File", "Needs Bytecode Chunk"]
          ]
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "1. The Compilation Phase (quantum)" }
      },
      {
        type: "paragraph",
        value: "The `quantum` binary is a master of transformation. It pushes your `.sa` source files through a rigorous 3-stage gauntlet before turning them into machine-readable code."
      },
      {
        type: "list",
        value: {
          ordered: true,
          items: [
            "**Lexical Scanning:** Reads raw text, normalizes varied syntax (Python/JS/C++) into standard tokens.",
            "**Scope Analysis:** Uses a `CompilerState` stack to manage locals, nesting, and upvalue capture logic.",
            "**Bytecode Generation:** Emits a flat, optimized `Chunk` (a dense instruction array)."
          ]
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "2. The Packaging Magic" }
      },
      {
        type: "paragraph",
        value: "What makes Quantum unique is how it bundles everything into a single file. When you compile, it wraps your code in a custom payload trailer that looks like this:"
      },
      {
        type: "code",
        value: {
          language: "text",
          code: `[ Bytecode Payload ]
[ Payload Size (uint32 Little-Endian) ]
[ "QNTM_VM!" Magic String (8 bytes) ]`
        }
      },
      {
        type: "paragraph",
        value: "On launch, the binary simply seeks to the end of its own file, checks for that 'QNTM_VM!' magic string, and instantly feeds the payload back into the VM."
      },
      {
        type: "heading",
        value: { level: 2, text: "3. The VM Runtime (qrun)" }
      },
      {
        type: "paragraph",
        value: "The `qrun` binary ignores text formats entirely. It only cares about executing instructions. It centers around a **CallFrame** stack—a core structure that isolates function calls, preventing variable leaking and managing execution memory safely."
      },
      {
        type: "code",
        value: {
          language: "cpp",
          code: `struct CallFrame {
    std::shared_ptr<Closure> closure; // The active bytecode logic
    size_t ip;                        // Where we are in the instruction list
    size_t stackBase;                 // Where local variables start
};`
        }
      },
      {
        type: "blockquote",
        value: {
          text: "Performance tip: By using a register-stack hybrid VM with a C++ std::variant engine to handle 12 concrete data types, Quantum avoids heavy garbage collection cycles, keeping your execution fast and memory usage tight.",
          cite: "Core Architecture Team"
        }
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
        value: "A great language isn't just defined by its syntax—it is defined by what you can build on day one without installing third-party dependencies. Quantum ships with a massive, high-performance **Standard Library** embedded directly within the virtual machine core, written in native C++ to ensure fast execution cycles across systems tasks."
      },
      {
        type: "heading",
        value: { level: 2, text: "The Core Namespace Architecture" }
      },
      {
        type: "paragraph",
        value: "Unlike heavy runtime environments that require complex module imports, Quantum registers its core primitives and collection handlers directly into the global execution table."
      },
      {
        type: "table",
        value: {
          headers: ["Namespace", "Key Functions & Built-ins", "Target Domain"],
          rows: [
            ["Core & Math", "len(), range(), isinstance(), abs(), sqrt(), mod_pow(), PI, INF", "Functional utilities & advanced math calculation"],
            ["Type Casts", "num(), int(), str(), bin(), parseInt(), parseFloat(), isNaN()", "Data normalization and dynamic layout checking"],
            ["Collections", "Native prototype loops: .map(), .filter(), .reduce(), .keys(), .values()", "In-place vector modification and dictionary hashing"],
            ["Crypto & Network", "sha256(), aes128_ecb_encrypt(), ip_in_cidr(), secure_random_hex()", "Low-level system defense and secure frame parsing"]
          ]
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "1. Cryptography, Hashing & Hardening" }
      },
      {
        type: "paragraph",
        value: "Quantum is uniquely optimized for low-level protocol security and validation tasks. It features timing-safe matching algorithms and standard symmetric cipher controls directly inside the VM runtime:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `# Generate secure tokens and check distribution density
let token = secure_random_hex(32)
let bits  = secure_random_int(1000, 9999)
let score = entropy("highly-complex-string-value-here")

# Industry standard hash pipelines return clean hex digests
let hashSig = sha256("payload_data")
let macroAuth = hmac_sha256("secret_key", "message_body")

# Native block level encryption and padding algorithms
let blockCipher = aes128_ecb_encrypt("16bytekeysecret!", pkcs7_pad("rawText", 16))

# Secure credential comparisons to neutralize timing vector leaks
if constant_time_eq(providedKey, correctKey):
    print("Handshake established safely")`
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "2. Native Network & Distance Utilities" }
      },
      {
        type: "paragraph",
        value: "For engineering infrastructure environments or streaming network headers, the standard library drops down to process raw IP strings, algorithmic distances, and subnet validations cleanly:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `# Fast CIDR calculations and subnet mapping
let subnetMask = "192.168.1.0"
if ip_in_cidr("192.168.1.45", "192.168.1.0/24"):
    let routeList = cidr_hosts("192.168.1.0/24")

# Binary string distance metrics (Levenshtein & Hamming algorithms)
let editCount = edit_distance("quantum", "quanta")
let isCardValid = luhn_check(4532718293812302)`
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "3. Low-Level Encoding, Streams & File I/O" }
      },
      {
        type: "paragraph",
        value: "Data streams can be shifted across varied encodings (such as Base64 framing, URL routing, or raw byte XOR masking masks) and read straight from disk paths with a simple operational signature:"
      },
      {
        type: "code",
        value: {
          language: "quantum",
          code: `# Simple high-performance file management pipelines
write_file("output.txt", "Data payload buffer stream configuration")
let localBuffer = read_file("input.txt")

# Hex and transport conversions
let encodedStr = base64_encode("hello world")
let webRouting = url_encode("query=quantum language")
let maskingField = xor_bytes(bytesA, bytesB) # Rapid XOR mask execution`
        }
      },
      {
        type: "heading",
        value: { level: 2, text: "4. Formatted Output Control" }
      },
      {
        type: "paragraph",
        value: "When utilizing `printf` routing definitions inside your `.sa` files, the underlying string parsing engine maps standard format identifiers directly to native system specifications:"
      },
      {
        type: "list",
        value: {
          ordered: false,
          items: [
            "**%d / %i** : Processes integers seamlessly.",
            "**%f / %e** : Formats floating points and scientific engineering notation scales.",
            "**%s / %c** : Maps standard textual strings and singular characters.",
            "**%x / %X** : Extracts hexadecimal sequences (lower / upper configuration layouts).",
            "**%b / %o** : Intercepts base-2 binary arrays and base-8 octal transformations directly."
          ]
        }
      },
      {
        type: "blockquote",
        value: {
          text: "By packing advanced cryptographic pipelines, subnet parsers, and explicit streaming formatting rules directly inside the runtime layer, Quantum eliminates development overhead and delivers optimal execution speeds without code bloat.",
          cite: "Standard Library Manifest"
        }
      }
    ]
  }
];
