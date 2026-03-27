import React, { useState, useMemo } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  InboxStackIcon, 
  ShieldCheckIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  ArchiveBoxIcon,
  FunnelIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import ColumnFilter from '../../components/ColumnFilter';
import ConfirmModal from '../../components/ConfirmModal';
import { toastSuccess, toastError } from '../../components/Toast';

export default function MasterInventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [drugs, setDrugs] = useState([
    { id: 1, name: 'Paracetamol', generic: 'Acetaminophen', category: 'Analgesics', variants: 32 },
    { id: 2, name: 'Amoxicillin', generic: 'Amoxicillin', category: 'Antibiotics', variants: 15 },
    { id: 3, name: 'Metformin', generic: 'Metformin Hydrochloride', category: 'Antidiabetics', variants: 8 },
    { id: 4, name: 'Atorvastatin', generic: 'Atorvastatin Calcium', category: 'Statins', variants: 12 },
  ]);

  const [categories, setCategories] = useState(['Analgesics', 'Antibiotics', 'Antidiabetics', 'Statins', 'Vitamins']);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [newDrug, setNewDrug] = useState({ name: '', generic: '', category: 'Analgesics' });
  
  // Advanced Filtering
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
    name: [],
    generic: [],
    category: []
  });

  const updateFilter = (column: string, values: string[]) => {
    setColumnFilters(prev => ({ ...prev, [column]: values }));
  };

  const activeFilterCount = Object.values(columnFilters).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);

  const handleAddDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDrug) {
      setDrugs(drugs.map(d => d.id === editingDrug.id ? { ...newDrug, id: d.id, variants: d.variants } : d));
      toastSuccess('Master Record Updated', `${newDrug.name} definition has been successfully modified.`);
    } else {
      setDrugs([...drugs, { ...newDrug, id: Date.now(), variants: 0 }]);
      toastSuccess('Master Record Created', `${newDrug.name} has been added to the global registry.`);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDrug(null);
    setNewDrug({ name: '', generic: '', category: 'Analgesics' });
    setShowNewCategoryInput(false);
  };

  const openEditModal = (drug: any) => {
    setEditingDrug(drug);
    setNewDrug({ name: drug.name, generic: drug.generic, category: drug.category });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    setDrugs(drugs.filter(d => d.id !== deleteConfirmId));
    toastSuccess('Master Record Removed', 'The drug definition has been detached from the global registry.');
    setDeleteConfirmId(null);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewDrug({ ...newDrug, category: newCategoryName });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };

  const uniqueNames = useMemo(() => [...new Set(drugs.map(d => d.name))].sort(), [drugs]);
  const uniqueGenerics = useMemo(() => [...new Set(drugs.map(d => d.generic))].sort(), [drugs]);
  const uniqueCategoriesOptions = useMemo(() => [...new Set(drugs.map(d => d.category))].sort(), [drugs]);

  const filteredDrugs = useMemo(() => {
    return drugs.filter(d => {
      const matchesName = columnFilters.name.length === 0 || columnFilters.name.includes(d.name);
      const matchesGeneric = columnFilters.generic.length === 0 || columnFilters.generic.includes(d.generic);
      const matchesCategory = columnFilters.category.length === 0 || columnFilters.category.includes(d.category);
      return matchesName && matchesGeneric && matchesCategory;
    });
  }, [drugs, columnFilters]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Inventory</h1>
          <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tight">Global Drug Dictionary</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group text-sm"
        >
          <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform" /> 
          Register Master Drug
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ArchiveBoxIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Master SKU</div>
            <div className="text-xl font-bold text-gray-900">{drugs.length}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TagIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Categories</div>
            <div className="text-xl font-bold text-gray-900">{categories.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Results Header with Reset */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
            <InboxStackIcon className="h-3.5 w-3.5" />
            <span>{filteredDrugs.length} Items Matching</span>
          </div>
          {activeFilterCount > 0 && (
            <button 
              onClick={() => setColumnFilters({ name: [], generic: [], category: [] })}
              className="flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <FunnelIcon className="h-3 w-3" />
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Scrollable Table Container */}
        <div className="max-h-[calc(100vh-320px)] min-h-[400px] overflow-y-auto custom-scrollbar pb-48">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 sticky top-0 z-30 backdrop-blur-md">
              <tr className="border-b border-gray-100">
                <ColumnFilter
                  label="Master Product"
                  options={uniqueNames}
                  selectedValues={columnFilters.name}
                  onFilterChange={(v) => updateFilter('name', v)}
                  className="px-8 py-4"
                />
                <ColumnFilter
                  label="Composition"
                  options={uniqueGenerics}
                  selectedValues={columnFilters.generic}
                  onFilterChange={(v) => updateFilter('generic', v)}
                  className="px-6 py-4"
                />
                <ColumnFilter
                  label="Category"
                  options={uniqueCategoriesOptions}
                  selectedValues={columnFilters.category}
                  onFilterChange={(v) => updateFilter('category', v)}
                  className="px-6 py-4"
                />
                <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Usage Density</th>
                <th className="px-8 py-4 text-right text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDrugs.length > 0 ? filteredDrugs.map((drug: any) => (
                <tr key={drug.id} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="px-8 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
                        <ArchiveBoxIcon className="h-4 w-4" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs">{drug.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-[11px] text-gray-600 font-medium italic">{drug.generic}</div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-gray-100 text-gray-600 uppercase tracking-tight">
                      {drug.category}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${Math.min(drug.variants * 3, 100)}%` }} />
                      </div>
                      <span className="text-[9px] font-semibold text-indigo-600 uppercase">
                        {drug.variants} Variants
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 transition-all">
                      <button 
                        onClick={() => openEditModal(drug)}
                        className="p-2 bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all"
                        title="Edit Master"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(drug.id)}
                        className="p-2 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                        title="Delete from Master"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No drugs found in the master registry matching your criteria.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-4 bg-indigo-900 rounded-2xl text-white flex items-center gap-4 shadow-xl shadow-indigo-100 overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <ShieldCheckIcon className="h-32 w-32" />
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheckIcon className="h-6 w-6 text-indigo-300" />
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-tight">Governance Mode Active</h4>
          <p className="text-indigo-200/80 text-[10px] max-w-2xl">
            Standardizing global generic definitions for all tenants.
          </p>
        </div>
      </div>

      {/* Register/Edit Drug Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingDrug ? "Edit Master Definition" : "Register Global Master Drug"}>
        <form onSubmit={handleAddDrug} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Primary Brand Name</label>
              <input
                type="text"
                required
                value={newDrug.name}
                onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all"
                placeholder="e.g. Panadol"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Generic Composition</label>
              <input
                type="text"
                required
                value={newDrug.generic}
                onChange={(e) => setNewDrug({ ...newDrug, generic: e.target.value })}
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium italic focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all"
                placeholder="e.g. Paracetamol 500mg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Pharmacology Category</label>
              {!showNewCategoryInput ? (
                <div className="flex gap-2">
                  <select
                    value={newDrug.category}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') {
                        setShowNewCategoryInput(true);
                      } else {
                        setNewDrug({ ...newDrug, category: e.target.value });
                      }
                    }}
                    className="flex-1 bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="ADD_NEW" className="text-indigo-600 font-black">+ Create New Category...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                  <input
                    type="text"
                    autoFocus
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-indigo-50 border-indigo-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAddNewCategory}
                    className="bg-indigo-600 text-white px-6 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Add
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowNewCategoryInput(false)}
                    className="bg-gray-100 text-gray-500 px-4 rounded-2xl hover:bg-gray-200 font-bold transition-all"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={closeModal} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
              {editingDrug ? 'Update Definition' : 'Commit to Global Registry'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Remove Master Registry"
        message="Are you sure you want to remove this master drug? This won't delete tenant stock but will detach it from the global registry system."
      />
    </div>
  );
}
