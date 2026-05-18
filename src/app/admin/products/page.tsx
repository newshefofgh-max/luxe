'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Grid,
  List,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Package,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { IProduct } from '@/types';

const DEFAULT_CATEGORIES = ['all'];

const STOCK_COLOR = (stock: number) => {
  if (stock < 5) return 'text-red-400';
  if (stock < 20) return 'text-yellow-400';
  return 'text-green-400';
};

const STOCK_BG = (stock: number) => {
  if (stock < 5) return 'bg-red-500/10 border-red-500/30';
  if (stock < 20) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-green-500/10 border-green-500/30';
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        const nav: { slug: string }[] = data.data?.nav_categories ?? [];
        if (nav.length > 0) setCategories(['all', ...nav.map((c) => c.slug)]);
      })
      .catch(() => {});
  }, []);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({ limit: '100' });
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      if (activeFilter !== 'all') params.set('isActive', activeFilter === 'active' ? 'true' : 'false');

      const res = await fetch(`/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        let items: IProduct[] = data.data;

        if (stockFilter === 'low') items = items.filter((p) => p.stock > 0 && p.stock < 20);
        else if (stockFilter === 'out') items = items.filter((p) => p.stock === 0);

        setProducts(items);
        setTotalCount(items.length);
      }
    } catch {}
    setIsLoading(false);
  }, [category, search, activeFilter, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleActive = async (product: IProduct) => {
    setTogglingId(product._id);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch {}
    setTogglingId(null);
  };

  const deleteProduct = async (id: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setTotalCount((c) => c - 1);
      }
    } catch {}
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{totalCount} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-[#111827] font-semibold rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                placeholder="Search products..."
                className="w-full bg-[#111827] border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
              className="bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock (&lt;20)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-[#C9A84C] text-[#111827]' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2 transition-colors ${view === 'table' ? 'bg-[#C9A84C] text-[#111827]' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#1f2937] rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No products found</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-[#1f2937] border rounded-xl overflow-hidden hover:border-gray-600 transition-all group ${
                product.isActive ? 'border-gray-700' : 'border-gray-700 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-800 relative overflow-hidden">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Package size={32} />
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-xs text-gray-300 bg-black/60 px-2 py-1 rounded-full">Inactive</span>
                  </div>
                )}
                {product.isFeatured && (
                  <span className="absolute top-2 left-2 text-xs bg-[#C9A84C] text-[#111827] font-bold px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate">{product.name}</p>
                <p className="text-gray-500 text-xs capitalize">{product.category}</p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#C9A84C] font-semibold text-sm">
                    EGP {product.price.toLocaleString()}
                  </span>
                  <span className={`text-xs font-medium border px-1.5 py-0.5 rounded-full ${STOCK_BG(product.stock)}`}>
                    <span className={STOCK_COLOR(product.stock)}>{product.stock} left</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3">
                  <Link
                    href={`/admin/products/${product._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-xs transition-colors"
                  >
                    <Edit2 size={11} />
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleActive(product)}
                    disabled={togglingId === product._id}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                    title={product.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {product.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product._id)}
                    className="p-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-[#1f2937] border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-[#111827]/50 text-xs text-gray-400">
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Sold</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                        {product.images[0] && (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs">{product.name}</p>
                        <p className="text-gray-600 text-xs">{product.nameAr}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 capitalize text-xs">{product.category}</td>
                  <td className="p-4">
                    <p className="text-[#C9A84C] font-medium text-xs">EGP {product.price.toLocaleString()}</p>
                    {product.comparePrice && (
                      <p className="text-gray-600 line-through text-xs">EGP {product.comparePrice.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold ${STOCK_COLOR(product.stock)}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{product.sold}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(product)}
                      disabled={togglingId === product._id}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        product.isActive
                          ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                          : 'bg-gray-700 text-gray-500 border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 size={13} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(product._id)}
                        className="p-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold">Delete Product?</h3>
            </div>
            <p className="text-gray-400 text-sm mb-5">
              This action cannot be undone. The product will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProduct(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
