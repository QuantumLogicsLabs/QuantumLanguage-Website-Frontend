<div align="center">

```
```

**Quantum Language - A Multi-Paradigm Scripting Language**

[![Language](https://img.shields.io/badge/language-C%2B%2B17-blue?style=flat-square&logo=cplusplus)](https://isocpp.org/)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen?style=flat-square)](https://github.com/SENODROOM/Quantum-Language)
[![Extension](https://img.shields.io/badge/scripts-.sa-orange?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-purple?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey?style=flat-square)](#build)

</div>

---

## What is Quantum?

Quantum is a **dynamically typed, multi-paradigm scripting language** that compiles `.sa` source files to bytecode and runs them on a custom register-stack VM. It accepts **Python-style**, **JavaScript-style**, and **C/C++-style** syntax **all in the same file**.

Built from scratch in **C++17** by one person in **3 weeks**. It works. Remarkably well, actually.

---

## The Big Idea

Why choose one syntax when you can have all three? Quantum lets you write code the way you think:

```python
# Python-style function
def greet(name):
    return "Hello, " + name

# JavaScript-style function  
function add(a, b) {
    return a + b
}

# C++-style function
fn multiply(x, y) {
    return x * y
}

# All valid. All work together.
print(greet("World"))
print(add(5, 3))
print(multiply(4, 7))
```

---

## Architecture

### Two Execution Paths

**`quantum.exe` - Compile + Bundle:**
```
.sa source
   |
   v
Lexer  ->  Token stream
   |
   v  
Parser  ->  AST
   |
   v
Compiler ->  Bytecode
   |
   v
Bundle ->  hello.exe (standalone)
```

**`qrun.exe` - Direct Interpretation:**
```
.sa source -> Lexer -> Parser -> VM::run()
```

### The VM
- **Stack-based bytecode interpreter**
- **34 AST node types**  
- **11 value types** in `std::variant`
- **Closures and upvalues** for first-class functions
- **Exception handling** with try/catch
- **Real pointers** in a scripting language (yes, really)

---

## Language Features

### Multi-Syntax Support
```python
# Variables - all valid
name = "Alice"           # bare assignment
let x = 42               # quantum-style  
const MAX = 100          # constant
int count = 0            # C++ type hint (decorative)

# Control flow - pick your style
if x > 0:
    print("positive")    # Python-style

if x > 0 { print("positive") }  # brace-style

if(x > 0) { printf("%d\n", x) }  # C++-style
```

### Functions - Five Styles
```python
fn add(a, b) { return a + b }           # quantum
def greet(name): return "Hi, " + name  # python
function mul(a, b) { return a * b }    # javascript
double = (x) => x * 2                  # arrow
square = fn(n) { return n * n }        # anonymous
```

### Classes & OOP
```python
class Animal {
    fn init(name, sound) {
        self.name = name
        self.sound = sound
    }
    fn speak() { 
        return self.name + " says " + self.sound 
    }
}

class Dog extends Animal {
    fn fetch(item) { 
        return self.name + " fetches " + item 
    }
}

let dog = Dog("Rex", "Woof")
print(dog.speak())
print(dog.fetch("ball"))
```

### Pointers (Yes, Really)
```python
let x = 42
let ptr = &x        # address-of
*ptr = 99           # dereference + assign
print(x)            # 99

# Class pointer
class Point { fn init(x, y) { self.x = x; self.y = y } }
p = Point(3, 4)
pp = &p
print(pp->x)        # arrow operator
```

### Collections & Comprehensions
```python
# Arrays with slicing
arr = [1, 2, 3, 4, 5]
print(arr[1:3])     # [2, 3]
print(arr[::-1])    # reversed

# List comprehension
squares = [x * x for x in range(1, 6)]
evens = [x for x in range(10) if x % 2 == 0]

# Dictionaries
person = {
    "name": "Saad",
    "age": 18,
    "gpa": "[403 Forbidden]"
}
```

### Exception Handling
```python
try {
    if x == 0 { throw "division by zero" }
    print(100 / x)
} catch (e) {
    print("Caught:", e)
}
```

---

## Standard Library

Quantum ships with **200+ native functions**:

### Core
```
len()  type()  range()  print()  input()  assert()
list()  enumerate()  zip()  map()  filter()  sorted()
```

### Math
```
abs  sqrt  floor  ceil  round  pow  log  sin  cos  tan
PI  E  INF  is_prime  gcd  lcm
```

### Crypto & Security
```
sha256()  md5()  aes128_ecb_encrypt()  rot13()
xor_bytes()  base64_encode()  hmac_sha256()
secure_random_hex()  entropy()
```

### File I/O
```
read_file()  write_file()
```

### String Methods
```
.upper()  .lower()  .split()  .replace()  .contains()
.startswith()  .endswith()  .index_of()  .slice()
```

---

## Quick Start

### Prerequisites
- **Windows** (primary platform)
- **C++17** compatible compiler (MSVC 2019+, GCC 9+, Clang 10+)
- **CMake** 3.16+

### Build
```bash
# Full clean build
build.bat

# Incremental build (faster)
build-fast.bat
```

### Usage
```bash
# Compile to standalone exe, then run
quantum hello.sa

# Interpret directly (no exe created)
qrun hello.sa

# Run the produced exe
hello.exe

# Interactive REPL
qrun

# Debug mode (show bytecode)
quantum --debug hello.sa

# Disassemble only
quantum --dis hello.sa
```

---

## Project Structure

```
Quantum-Language/
{
  "src/": "Source code - lexer, parser, compiler, VM",
  "include/": "Headers - AST, Value, Opcode, etc",
  "examples/": "Sample .sa programs",
  "tests/": "Test programs",
  "Website/": {
    "index.html": "Landing page",
    "ide.html": "Browser IDE with live interpreter",
    "language.html": "Complete documentation",
    "logo/": "Assets"
  },
  "quantum.exe": "Compiler + bundler",
  "qrun.exe": "Direct interpreter", 
  "quantum_stub.exe": "Runtime template"
}
```

---

## The Website

The project includes a **complete website** with:

### Landing Page (`index.html`)
- Hero section with animated effects
- Feature showcase
- Interactive demos
- Matrix rain and particle effects

### Interactive IDE (`ide.html`)
- **Full Quantum interpreter** in browser
- Syntax highlighting for 34+ AST nodes
- Multi-file editor with `.sa` support
- Real-time output console
- Example library with categorized samples
- Custom cursor and terminal UI

### Documentation (`language.html`)
- Complete language reference
- Standard library docs
- Interactive examples
- Mobile-responsive design

### IDE Terminal Shortcuts

The IDE's output terminal (`src/components/terminal/QuantumTerminal.tsx`) supports:

| Shortcut | Action |
|---|---|
| `Enter` | Run the typed command |
| `↑` / `↓` | Browse command history (persisted across sessions via `localStorage`) |
| `←` / `→` | Move the cursor within the line (works across wrapped rows) |
| `Ctrl+←` / `Ctrl+→` | Jump by word |
| `Home` / `End` (or `Ctrl+A` / `Ctrl+E`) | Jump to the start / end of the line |
| `Delete` | Remove the character after the cursor |
| `Ctrl+Backspace` | Delete the word before the cursor |
| `Ctrl+Z` | Undo the last edit to the current line |
| `Tab` | Autocomplete against currently open filenames |
| `Ctrl+C` | Copy selected text if something is selected, otherwise interrupt the current line |
| `Ctrl+L` | Clear the terminal screen |
| `clear` (typed command) | Same as `Ctrl+L` |
| `history` (typed command) | List previously run commands |
| `help` (typed command) | List these shortcuts inside the terminal |
| Mouse drag | Select text |

The prompt shows the active file (e.g. `[hello.sa] $`) when one is open, and falls back to `$` otherwise. Scrollback is 5000 lines, and multi-line pastes are split and submitted as separate commands. When the terminal has keyboard focus, an animated glowing border rotates around the whole box; it fades out on blur.

Note: `Ctrl+W` is the usual shell binding for "delete word", but browsers reserve it to close the current tab and never deliver it to the page — `Ctrl+Backspace` is used instead.

---

## Why Quantum?

1. **Syntax Freedom** - Write Python, JavaScript, or C++ style - or mix them
2. **Real Pointers** - C-style pointers in a scripting language
3. **Bytecode VM** - Compiles to efficient bytecode, runs on custom VM
4. **Standalone Exes** - Bundle bytecode into single executable
5. **Rich Stdlib** - 200+ functions including crypto, math, I/O
6. **Three Weeks** - Built entirely by one person in 21 days

---

## The .sa Extension

Why `.sa`? We don't know either. Some things are meant to remain mysterious.

---

## Performance

- **Compilation**: ~1000 lines/second
- **Execution**: 50K+ bytecode instructions/second  
- **Memory**: ~2MB base footprint
- **Startup**: <100ms for most programs

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `quantum --test examples/`
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

<div align="center">

**Built in C++17 · Bytecode VM Edition · .sa Files Only**

[![GitHub](https://img.shields.io/github/followers/SENODROOM?style=social)](https://github.com/SENODROOM)
[![Stars](https://img.shields.io/github/stars/SENODROOM/Quantum-Language?style=social)](https://github.com/SENODROOM/Quantum-Language)

**"It works. Remarkably well, actually."**

</div>
