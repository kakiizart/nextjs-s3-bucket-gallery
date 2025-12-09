# Next.js Supabase S3 Bucket Gallery

A minimal, clean, and fully functional **image gallery app** built with **Next.js**, **Supabase Storage**, and **Supabase Auth**.  
Users can authenticate, upload images to Supabase buckets, and browse a responsive gallery UI.

This project is designed to be simple, fast, and production-ready — perfect as a learning example, portfolio piece, or starter for a larger storage/file-management app.

---

## 🚀 Features

### Authentication
- Email/password login  
- Supabase Auth Browser Client  
  (configured in `supabaseBrowserClient.js`)

### Storage Operations
- Create buckets  
- Upload images  
- Fetch & load bucket contents  
- Render images in a gallery grid  

### UI
- Clean, minimal layout  
- Pages: **Create**, **Upload**, **Load**, **Gallery**

---

## 🧱 Tech Stack

- **Next.js 14+**
- **React (App Router)**
- **Supabase JS Client**
- **Supabase Storage API**
- **TailwindCSS** (optional depending on your styling choices)

---

## 📂 Project Structure

/
app/
create/
upload/
load/
gallery/
components/
lib/
supabaseBrowserClient.js
public/
...

yaml
Copy code

### Correctly Ignored (Not Included in Repo)

- `.env.local`
- `.next/`
- `node_modules/`

---

## ⚙️ Environment Variables

Create a `.env.local` file:

NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

powershell
Copy code

If using the Vite version:

VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key

csharp
Copy code

These are consumed by:

lib/supabaseBrowserClient.js

yaml
Copy code

---

## 🏁 Getting Started

Install dependencies:

```bash
npm install
Run the development server:

bash
Copy code
npm run dev
Open:

arduino
Copy code
http://localhost:3000
📸 How the App Works
1️⃣ Create Bucket
Navigate to /create, enter a bucket name → Supabase creates the storage bucket.

2️⃣ Upload Image
Go to /upload, choose a bucket + file → upload via supabase.storage.from(bucket).upload().

3️⃣ Load Buckets
The /load page fetches all buckets and displays them.

4️⃣ View Gallery
The /gallery page loads and renders all uploaded images from the selected bucket.

This workflow matches the original “vanilla” app (Create → Upload → Load → Gallery).

🧪 Supabase Client Overview
js
Copy code
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
export default supabase;
📦 Deployment
Deploy easily on:

Vercel (recommended)

Netlify

Supabase Hosting

Be sure to add environment variables in your hosting provider settings.

🤝 Contributing
PRs are welcome.
Future enhancements could include:

Drag-and-drop uploads

Folder support

Metadata display

Infinite scroll

RLS rules for multi-user access

📄 License
MIT — free for personal, academic, or commercial use.
