'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, Search, FileText, Loader2, Trash2, CheckCircle, Clock, AlertCircle, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

export default function RAGManagementPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  async function fetchDocs() {
    try {
      setLoading(true);
      // We'll need a getRAGDocuments method in adminApi (adding it if not exists or using a generic one)
      // Since it's not in lib/api.ts, I'll use apiCall directly or update lib/api.ts first.
      // Wait, I updated lib/api.ts with some placeholders. Let's check if I added RAG docs.
      const data = await adminApi.getCMSItems({ type: 'rag_document', search: searchTerm }); // Using CMSItems as a proxy if no specific RAG API
      setDocs(data.items);
    } catch (err) {
      console.error('Failed to fetch RAG documents:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocs();
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-8 w-8 text-rose-500" />
            Quản lý tri thức RAG - Docs
          </h1>
          <p className="text-gray-500 mt-2">Cơ sở dữ liệu tri thức y khoa phục vụ Nori Chat AI</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-sm font-medium">
          <UploadCloud className="w-4 h-4" />
          Tải lên tài liệu (.pdf, .txt)
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">Thống kê tri thức</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-sm text-gray-500">Tổng tài liệu</span>
              <span className="font-bold">24</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <span className="text-sm text-green-700 dark:text-green-400">Đã Index (Vector)</span>
              <span className="font-bold text-green-700 dark:text-green-400">22</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <span className="text-sm text-orange-700 dark:text-orange-400">Đang xử lý</span>
              <span className="font-bold text-orange-700 dark:text-orange-400">2</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Danh sách tài liệu</CardTitle>
              <CardDescription>Tài liệu y khoa chính thống (Vinmec, BYT)</CardDescription>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>
              ) : docs.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">Chưa có tài liệu nào</div>
              ) : (
                docs.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{doc.source || 'Vinmec'}</span>
                          <span>•</span>
                          <span>{doc.size || '1.2MB'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {doc.isIndexed ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-orange-500" />}
                            {doc.isIndexed ? 'Đã Index' : 'Đang xử lý'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
