import os
import sys
import json
import time
import urllib.parse
import urllib.request
import urllib.error
import re
from datetime import datetime
from dotenv import load_dotenv

# Fix UTF-8 output encoding for Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables from .env files
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.dirname(SCRIPT_DIR)

# Load .env file from frontend root
load_dotenv(os.path.join(FRONTEND_DIR, ".env"))

PUBLIC_DIR = os.path.join(FRONTEND_DIR, "public")
POSTS_DIR = os.path.join(FRONTEND_DIR, "src", "data", "posts")
OUTPUT_FILE = os.path.join(POSTS_DIR, "aiGeneratedPosts.ts")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Quantum Language Spec Context for AI
QUANTUM_SPEC = """
Quantum Language Specification:
- Dynamically typed multi-syntax scripting language (.sa files) compiling to bytecode on a register-stack VM.
- Accepts Python style (# comments, indentation), JS style (arrows, closures), and C/C++ style ({}, printf, cout) in the same file.
- 3 Binaries: quantum.exe (bundler), qrun.exe (runtime/REPL), quantum_stub.exe (VM template).
- Standard Library: Core math (abs, sqrt, mod_pow), Types (num, int, str), Strings (.trim, .upper, .split), Arrays (.push, .map, .filter), Dicts (.get, .set, .keys), Crypto (sha256, hmac_sha256, aes128_ecb_encrypt, constant_time_eq), Network (ip_in_cidr, cidr_hosts), Distance (edit_distance, luhn_check).
- Pointers: Address-of (&), Dereference (*), Arrow (->) backed by std::shared_ptr<QuantumValue>.
- VM: CallFrame (closure, ip, stackBase), Upvalues (cell, closed), PUSH_HANDLER exception unwinding.
- Testing: quantum --test with POSIX signal handlers and setjmp/longjmp.
"""

GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
]

def generate_live_groq_blog(topic_index, api_key):
    """Queries Groq REST API (llama-3.3-70b-versatile) for ultra-fast, high-quality BlogPost generation."""
    current_date = datetime.now().strftime("%B %d, %Y")

    prompt_text = f"""
    {QUANTUM_SPEC}

    Write a complete, highly technical, original blog post for Quantum Language (Post Index #{topic_index}).
    Return strictly raw JSON format matching this exact structure:
    {{
      "id": "post-ai-live-{topic_index}",
      "slug": "url-friendly-slug-for-post-{topic_index}",
      "title": "Engaging Technical Blog Title",
      "category": "One of: Language Guide, Architecture, Standard Library, Performance, Systems Programming, Tutorials",
      "author": "Core Compiler Team or Security Group or DevRel",
      "date": "{current_date}",
      "readingTime": "5 min read",
      "coverImage": "/blog_ai_live_{topic_index}.png",
      "excerpt": "A compelling 2-3 sentence overview of this blog post.",
      "imagePrompt": "Futuristic 3D tech graphic banner featuring glowing quantum circuits, glassmorphic abstract nodes, vibrant neon cyan and purple accents, high contrast sleek dark mode aesthetic",
      "content": [
        {{ "type": "paragraph", "value": "Detailed introduction explaining the topic..." }},
        {{ "type": "heading", "value": {{ "level": 2, "text": "1. Code Implementation & Usage" }} }},
        {{ "type": "paragraph", "value": "Explanation of the code below..." }},
        {{ "type": "code", "value": {{ "language": "quantum", "code": "# Quantum code demonstration\\nlet x = 42" }} }},
        {{ "type": "heading", "value": {{ "level": 2, "text": "2. VM Runtime & Architecture" }} }},
        {{ "type": "paragraph", "value": "Explanation of how VM registers or standard library handles this..." }},
        {{ "type": "blockquote", "value": {{ "text": "Takeaway quote regarding performance...", "cite": "Quantum Engineering Spec" }} }}
      ]
    }}
    """

    for model_name in GROQ_MODELS:
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = {
            "model": model_name,
            "messages": [
                {"role": "user", "content": prompt_text}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7
        }
        try:
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                raw_text = result['choices'][0]['message']['content'].strip()
                post_data = json.loads(raw_text)
                print(f"  ⚡ Generated live text with Groq model: {model_name}")
                return post_data
        except Exception as e:
            print(f"  ⚠️ Groq model {model_name} notice: {e}")
            continue

    raise RuntimeError("All Groq models failed.")

def download_ai_cover_image(prompt_text, filename):
    """Generates and downloads a free 16:9 dark-mode tech banner via Pollinations AI API with retries and premium aesthetics."""
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    target_path = os.path.join(PUBLIC_DIR, filename)

    style_modifiers = "futuristic quantum tech banner, 3d render, octane render, glowing cyan and violet neon accents, glassmorphism, dynamic lighting, 8k resolution, cinematic composition, photorealistic dark mode background, 16:9 aspect ratio, no text, no letters"
    full_prompt = f"{prompt_text}, {style_modifiers}"
    seed = int(time.time())
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true&enhance=true&seed={seed}"

    print(f"  📷 Generating AI cover image: {filename}...")
    
    # Try Pollinations AI with 3 retries
    for attempt in range(1, 4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=35) as response:
                with open(target_path, 'wb') as f:
                    f.write(response.read())
            print(f"  ✅ Saved AI cover image to public/{filename}")
            return f"/{filename}"
        except Exception as e:
            print(f"  ⚠️ Image API attempt #{attempt} notice ({e})")
            if attempt < 3:
                time.sleep(3 * attempt)

    print("  ⚠️ Pollinations AI timed out after retries. Using standard fallback cover.")
    return "/standard_library.png"

def load_existing_posts():
    """Reads existing posts from aiGeneratedPosts.ts if available."""
    if not os.path.exists(OUTPUT_FILE):
        return []
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'export const aiGeneratedPosts:\s*BlogPost\[\]\s*=\s*(\[[\s\S]*\]);', content)
            if match:
                return json.loads(match.group(1))
    except Exception as e:
        print(f"⚠️ Notice: Could not read existing posts ({e}). Starting fresh.")
    return []

def write_typescript_dataset(posts):
    """Writes the generated BlogPost array into TypeScript format."""
    os.makedirs(POSTS_DIR, exist_ok=True)
    
    ts_content = "import { BlogPost } from '../blogs';\n\n"
    ts_content += "export const aiGeneratedPosts: BlogPost[] = "
    ts_content += json.dumps(posts, indent=2) + ";\n"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"\n✅ Successfully saved {len(posts)} total AI posts in {OUTPUT_FILE}")

def main():
    print("🤖 Starting Python Live AI Blog & Image Generator for Quantum Logics...")

    if not GROQ_API_KEY:
        print("💡 No GROQ_API_KEY found in .env. Add GROQ_API_KEY to enable live LLM synthesis.")
        return

    print("⚡ Groq API Key detected! Requesting live text generation via Groq (Llama-3.3-70B)...")

    existing_posts = load_existing_posts()
    posts = list(existing_posts)
    
    # Calculate next post index based on existing posts count
    start_index = len(existing_posts) + 1
    count = 1  # Generate 1 new post per daily run

    for i in range(start_index, start_index + count):
        print(f"\n📝 Generating Daily AI Blog Post #{i}...")
        try:
            post = generate_live_groq_blog(i, GROQ_API_KEY)
            post["date"] = datetime.now().strftime("%B %d, %Y")
            img_prompt = post.get("imagePrompt", post["title"] + " tech banner dark mode")
            filename = f"blog_ai_live_{i}_{post['slug']}.png"
            post["coverImage"] = download_ai_cover_image(img_prompt, filename)
            
            if "imagePrompt" in post:
                del post["imagePrompt"]

            posts.append(post)
            time.sleep(2) # Friendly delay
        except Exception as e:
            print(f"  ⚠️ Error generating live post #{i}: {e}")

    if len(posts) > len(existing_posts):
        write_typescript_dataset(posts)
        print("\n🎉 Live Daily AI Blog Generation Complete!")
    else:
        print("\n⚠️ No new blog post was added.")

if __name__ == "__main__":
    main()
