"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Bucket = {
  id: string;
  name: string;
};

type GalleryItem = {
  name: string;
  path: string;
  url: string;
  createdAt: string | null;
};

function useLogs() {
  const [logs, setLogs] = useState<string[]>([]);

  function log(message: string) {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${ts}] ${message}`, ...prev]);
  }

  return { logs, log };
}

export function GalleryClient() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [newBucketName, setNewBucketName] = useState("");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { logs, log } = useLogs();

  // ----------------- Buckets -----------------

  async function fetchBuckets() {
    setLoadingBuckets(true);
    setError(null);
    try {
      const res = await fetch("/api/buckets/list");
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || `List buckets failed (${res.status})`);
      }

      const data = (json || []) as Bucket[];

      setBuckets(data);
      if (!selectedBucket && data.length) {
        setSelectedBucket(data[0].name);
      }
      log(`Buckets loaded (${data.length})`);
    } catch (err: any) {
      setError(err.message || "Failed to load buckets");
      log(`Error loading buckets: ${err.message || err}`);
    } finally {
      setLoadingBuckets(false);
    }
  }

  async function handleCreateBucket() {
    const name = newBucketName.trim();
    if (!name) return;

    setError(null);
    try {
      const res = await fetch("/api/buckets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.error || `Create bucket failed (${res.status})`
        );
      }

      log(`Bucket "${name}" created.`);
      setNewBucketName("");
      await fetchBuckets();
      setSelectedBucket(name);
    } catch (err: any) {
      setError(err.message || "Failed to create bucket");
      log(`Error creating bucket: ${err.message || err}`);
    }
  }

  useEffect(() => {
    void fetchBuckets();
  }, []);

  // ----------------- Gallery -----------------

  async function loadGallery() {
    if (!selectedBucket) {
      setError("Select a bucket first");
      return;
    }

    setLoadingGallery(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/gallery/list?bucket=${encodeURIComponent(selectedBucket)}`
      );
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.error || `Load gallery failed (${res.status})`
        );
      }

      const data = (json || []) as GalleryItem[];

      setItems(data);
      log(`Loaded ${data.length} item(s) from bucket "${selectedBucket}".`);
    } catch (err: any) {
      setError(err.message || "Failed to load gallery");
      log(`Error loading gallery: ${err.message || err}`);
    } finally {
      setLoadingGallery(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!selectedBucket) {
      setError("Select a bucket first");
      return;
    }
    if (!files || !files.length) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("bucket", selectedBucket);
    for (const f of Array.from(files)) {
      formData.append("files", f);
    }

    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || `Upload failed (${res.status})`);
      }

      log(`Uploaded ${files.length} file(s) to "${selectedBucket}".`);
      await loadGallery();
    } catch (err: any) {
      setError(err.message || "Upload failed");
      log(`Error uploading files: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(path: string) {
    if (!selectedBucket) return;
    if (!confirm(`Delete "${path}" from "${selectedBucket}"?`)) return;

    setError(null);
    try {
      const res = await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: selectedBucket, path }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || `Delete failed (${res.status})`);
      }

      setItems((prev) => prev.filter((i) => i.path !== path));
      log(`Deleted "${path}" from "${selectedBucket}".`);
    } catch (err: any) {
      setError(err.message || "Delete failed");
      log(`Error deleting file: ${err.message || err}`);
    }
  }

  // ----------------- UI helpers -----------------

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files?.length) {
      void uploadFiles(files);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  // ----------------- Render -----------------

  return (
    <div className="space-y-6">
      {/* Step 1 — Create bucket */}
      <section className="rounded-2xl border border-zinc-200 bg-zinc-900/5 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-amber-300">
          Step 1 — Create bucket
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          After creation, the bucket will appear in the selector below and can
          be used in both the vanilla app and this Next.js app.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="e.g. demo-bucket"
            className="max-w-xs"
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
          />
          <Button type="button" onClick={handleCreateBucket}>
            Create
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchBuckets}
            disabled={loadingBuckets}
          >
            {loadingBuckets ? "Refreshing…" : "Refresh buckets"}
          </Button>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Buckets loaded: {buckets.length}
        </p>
      </section>

      {/* Step 2 — Select & upload */}
      <section className="rounded-2xl border border-zinc-200 bg-zinc-900/5 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-amber-300">
          Step 2 — Select & upload
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            className="h-9 rounded-md border border-zinc-300 bg-zinc-950 px-3 text-sm text-zinc-50 dark:border-zinc-700"
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
          >
            {buckets.length === 0 && <option value="">No buckets</option>}
            {buckets.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadGallery}
            disabled={loadingGallery || !selectedBucket}
          >
            {loadingGallery ? "Loading…" : "Load gallery"}
          </Button>
        </div>

        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-500/50 bg-zinc-900/40 px-4 py-10 text-center text-xs text-zinc-400"
        >
          <p className="font-semibold text-zinc-200">Drag & Drop Images</p>
          <p className="mt-1 text-[11px]">PNG, JPG, JPEG, GIF, WEBP</p>
          <p className="mt-1 text-[11px] text-zinc-500">or</p>

          <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-full bg-zinc-800 px-4 py-1.5 text-[11px] font-medium text-zinc-100 hover:bg-zinc-700">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
            Choose files
          </label>

          <p className="mt-3 text-[11px] text-zinc-500">
            Selected bucket:{" "}
            <span className="font-semibold text-zinc-200">
              {selectedBucket || "none"}
            </span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={uploading}
            onClick={() => {
              alert("Use the file picker or drag & drop to upload.");
            }}
          >
            {uploading ? "Uploading…" : "Upload selected file(s)"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadGallery}
            disabled={loadingGallery || !selectedBucket}
          >
            Load gallery
          </Button>
        </div>
      </section>

      {/* Errors */}
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}

      {/* Logs */}
      <section className="rounded-2xl border border-zinc-200 bg-zinc-900/5 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-amber-300">Logs</h2>
        <div className="mt-3 h-40 overflow-y-auto rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-[11px] font-mono text-zinc-300">
          {logs.length === 0 && (
            <p className="text-zinc-500">No logs yet.</p>
          )}
          {logs.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="rounded-2xl border border-zinc-200 bg-zinc-900/5 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h2 className="text-sm font-semibold text-amber-300">Gallery</h2>

        {items.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No images yet. Choose a bucket and click &quot;Load gallery&quot;.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.path}
                className="group overflow-hidden rounded-xl border border-zinc-700 bg-black/40"
              >
                <div className="relative aspect-square bg-zinc-900">
                  {/* Use plain img because URLs are dynamic signed links */}
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="truncate text-[11px] text-zinc-200">
                    {item.name}
                  </p>
                  <button
                    className="rounded-full bg-red-900/60 px-2 py-0.5 text-[10px] font-semibold text-red-100 hover:bg-red-800"
                    onClick={() => void handleDelete(item.path)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
