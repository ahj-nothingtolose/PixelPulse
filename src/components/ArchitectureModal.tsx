import React, { useState } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  Code2,
  HardDrive,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { usePulse } from '../context/PulseContext';
import {
  SUPABASE_SCHEMA_SQL,
  SUPABASE_STORAGE_SQL,
  SUPABASE_CLIENT_SNIPPET,
} from '../data/supabaseBlueprint';

export const ArchitectureModal: React.FC = () => {
  const {
    isArchitectureModalOpen,
    setIsArchitectureModalOpen,
    users,
    posts,
    resetDemoDatabase,
    showToast,
  } = usePulse();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'schema' | 'storage' | 'client'
  >('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isArchitectureModalOpen) return null;

  const totalLikes = posts.reduce((acc, p) => acc + p.likesUserIds.length, 0);
  const totalComments = posts.reduce((acc, p) => acc + p.comments.length, 0);

  const handleCopy = (key: string, content: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedKey(key);
    showToast('Copied code snippet to clipboard');
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
      onClick={() => setIsArchitectureModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                PixelPulse Architecture & Supabase Setup Blueprint
              </h2>
              <p className="text-xs text-zinc-400">
                PostgreSQL Schema (Profiles, Posts, Likes, Comments) · Storage Bucket RLS · Canvas Upload Flow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsArchitectureModalOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            aria-label="Close architecture blueprint"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-rose-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>01. Architecture & Setup Guide</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-rose-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>02. PostgreSQL Schema (SQL)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-rose-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>03. Storage Bucket & RLS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('client')}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'client'
                ? 'border-rose-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>04. Supabase React Client</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Live In-Memory / LocalStorage State Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <p className="text-xs text-zinc-400">public.profiles</p>
                  <p className="text-2xl font-bold text-zinc-100 font-mono tabular-nums mt-1">
                    {users.length} rows
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <p className="text-xs text-zinc-400">public.posts (9:16)</p>
                  <p className="text-2xl font-bold text-zinc-100 font-mono tabular-nums mt-1">
                    {posts.length} rows
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <p className="text-xs text-zinc-400">public.likes</p>
                  <p className="text-2xl font-bold text-zinc-100 font-mono tabular-nums mt-1">
                    {totalLikes} rows
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <p className="text-xs text-zinc-400">public.comments</p>
                  <p className="text-2xl font-bold text-zinc-100 font-mono tabular-nums mt-1">
                    {totalComments} rows
                  </p>
                </div>
              </div>

              {/* System Architecture Breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-100">
                  1. System Architecture & 9:16 Media Pipeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                    <p className="font-semibold text-zinc-100">
                      01. Client Darkroom Canvas
                    </p>
                    <p className="text-zinc-400 leading-relaxed">
                      Accepts JPEG/PNG/WebP, calculates an automatic 9:16 center-cover crop (540×960 / 1080×1920), applies real-time Exposure, Contrast, Saturation, Kelvin Temperature, and B&W filters on HTML5 Canvas, and encodes a compressed JPEG Blob.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                    <p className="font-semibold text-zinc-100">
                      02. Supabase Storage CDN
                    </p>
                    <p className="text-zinc-400 leading-relaxed">
                      Uploads the rendered 9:16 Blob into the public <code className="text-rose-400">pixelpulse-media</code> bucket under <code className="text-zinc-300">{`{user_id}/{timestamp}-9x16.jpg`}</code> enforced by Row Level Security folder checks.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                    <p className="font-semibold text-zinc-100">
                      03. PostgreSQL & Triggers
                    </p>
                    <p className="text-zinc-400 leading-relaxed">
                      Stores relational rows in <code className="text-zinc-300">profiles</code>, <code className="text-zinc-300">posts</code>, <code className="text-zinc-300">likes</code>, and <code className="text-zinc-300">comments</code>. A PostgreSQL trigger automatically increments/decrements <code className="text-zinc-300">likes_count</code> on double-tap likes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Supabase Setup Instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-100">
                  2. Step-by-Step Supabase Setup Instructions
                </h3>
                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    <p className="font-semibold text-zinc-100">
                      Step 1: Create Project & Configure Environment Variables
                    </p>
                    <p className="text-zinc-400 mt-1 leading-relaxed">
                      Create a new project at <span className="font-mono text-zinc-200">database.new</span>, install <code className="text-rose-400">npm install @supabase/supabase-js</code>, and add <code className="text-zinc-200">VITE_SUPABASE_URL</code> and <code className="text-zinc-200">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-zinc-200">.env</code> file.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    <p className="font-semibold text-zinc-100">
                      Step 2: Provision Database Tables & Like Trigger
                    </p>
                    <p className="text-zinc-400 mt-1 leading-relaxed">
                      Open the <span className="text-zinc-200 font-medium">02. PostgreSQL Schema (SQL)</span> tab above, copy the DDL script, and run it in your Supabase SQL Editor to create <code className="text-zinc-200">profiles</code>, <code className="text-zinc-200">posts</code>, <code className="text-zinc-200">likes</code>, and <code className="text-zinc-200">comments</code> with RLS enabled.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    <p className="font-semibold text-zinc-100">
                      Step 3: Provision the 9:16 Media Storage Bucket
                    </p>
                    <p className="text-zinc-400 mt-1 leading-relaxed">
                      Open the <span className="text-zinc-200 font-medium">03. Storage Bucket & RLS</span> tab above and execute the bucket policy script so authenticated photographers can upload rendered 9:16 JPEGs to <code className="text-rose-400">pixelpulse-media</code>.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    <p className="font-semibold text-zinc-100">
                      Step 4: Enable Email & Anonymous Guest Auth
                    </p>
                    <p className="text-zinc-400 mt-1 leading-relaxed">
                      In Supabase Dashboard → Authentication → Providers, enable <span className="text-zinc-200">Email/Password</span> and toggle <span className="text-zinc-200">Allow Anonymous Sign-Ins</span> so guest photographers can test the 9:16 editor immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <span className="text-xs text-zinc-400">
                  Local state persists in your browser and mirrors the exact Supabase schema.
                </span>
                <button
                  type="button"
                  onClick={resetDemoDatabase}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Seed Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Complete PostgreSQL DDL for <code className="text-zinc-200">profiles</code>, <code className="text-zinc-200">posts</code>, <code className="text-zinc-200">likes</code>, <code className="text-zinc-200">comments</code>, and automatic like count triggers:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy('schema', SUPABASE_SCHEMA_SQL)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  {copiedKey === 'schema' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied SQL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Schema SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Storage bucket creation and Row Level Security policies for <code className="text-rose-400">pixelpulse-media</code>:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy('storage', SUPABASE_STORAGE_SQL)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  {copiedKey === 'storage' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Storage SQL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Bucket SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                {SUPABASE_STORAGE_SQL}
              </pre>
            </div>
          )}

          {activeTab === 'client' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  End-to-end TypeScript helper converting the 9:16 HTML5 Canvas into a Supabase Storage upload + PostgreSQL insert:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy('client', SUPABASE_CLIENT_SNIPPET)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  {copiedKey === 'client' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied TypeScript</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Client Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                {SUPABASE_CLIENT_SNIPPET}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
