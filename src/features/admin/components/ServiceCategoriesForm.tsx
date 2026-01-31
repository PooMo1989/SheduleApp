'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean | null;
    created_at: string | null;
    updated_at: string | null;
    display_order: number | null;
    tenant_id: string;
}

/**
 * Service Categories Management Form
 * Allows admins to create, edit, and delete service categories
 * Uses optimistic updates for instant feedback
 */
export function ServiceCategoriesForm() {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
    const [editCategory, setEditCategory] = useState({ name: '', slug: '', description: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

    const { data: categories, isLoading } = trpc.category.getAll.useQuery();
    const utils = trpc.useUtils();

    // Clear highlight after animation
    useEffect(() => {
        if (recentlyAddedId) {
            const timer = setTimeout(() => setRecentlyAddedId(null), 1000);
            return () => clearTimeout(timer);
        }
    }, [recentlyAddedId]);

    const createCategory = trpc.category.create.useMutation({
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await utils.category.getAll.cancel();

            // Snapshot previous value
            const previousCategories = utils.category.getAll.getData();

            // Create optimistic category with temp ID
            const tempId = `temp-${Date.now()}`;
            const optimisticCategory: Category = {
                id: tempId,
                name: variables.name,
                slug: variables.slug,
                description: variables.description || null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                display_order: null,
                tenant_id: '', // Will be set by server
            };

            // Optimistically add to cache in alphabetically sorted position
            utils.category.getAll.setData(undefined, (old) => {
                if (!old) return [optimisticCategory];
                // Find correct position for alphabetical order (case-insensitive)
                const insertIndex = old.findIndex(
                    cat => cat.name.toLowerCase().localeCompare(optimisticCategory.name.toLowerCase()) > 0
                );
                const newList = [...old];
                // Insert at found position, or at end if it should be last
                newList.splice(insertIndex === -1 ? old.length : insertIndex, 0, optimisticCategory);
                return newList;
            });

            // Close form and reset immediately for smooth UX
            setIsAdding(false);
            setNewCategory({ name: '', slug: '', description: '' });
            setRecentlyAddedId(tempId);

            return { previousCategories, tempId };
        },
        onSuccess: (data, variables, context) => {
            // Replace temp ID with real ID in cache
            utils.category.getAll.setData(undefined, (old) => {
                if (!old) return old;
                return old.map(cat =>
                    cat.id === context?.tempId
                        ? { ...cat, id: data.category.id }
                        : cat
                );
            });
            setRecentlyAddedId(data.category.id);
            toast.success('Category created');
        },
        onError: (error, variables, context) => {
            // Roll back on error
            if (context?.previousCategories) {
                utils.category.getAll.setData(undefined, context.previousCategories);
            }
            // Reopen form with the data so user can try again
            setIsAdding(true);
            setNewCategory({
                name: variables.name,
                slug: variables.slug,
                description: variables.description || '',
            });
            toast.error(error.message || 'Failed to create category');
        },
    });

    const updateCategory = trpc.category.update.useMutation({
        onMutate: async (variables) => {
            await utils.category.getAll.cancel();
            const previousCategories = utils.category.getAll.getData();

            // Optimistically update in cache and re-sort if name changed
            utils.category.getAll.setData(undefined, (old) => {
                if (!old) return old;
                // Update the category
                const updated = old.map(cat =>
                    cat.id === variables.id
                        ? { ...cat, name: variables.name, slug: variables.slug, description: variables.description ?? null }
                        : cat
                );
                // Re-sort alphabetically (case-insensitive)
                return updated.sort((a, b) =>
                    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                );
            });

            // Close edit mode immediately
            const editingIdSnapshot = editingId;
            const editCategorySnapshot = { ...editCategory };
            setEditingId(null);
            setEditCategory({ name: '', slug: '', description: '' });

            return { previousCategories, editingIdSnapshot, editCategorySnapshot };
        },
        onSuccess: () => {
            toast.success('Category updated');
        },
        onError: (error, variables, context) => {
            // Roll back on error
            if (context?.previousCategories) {
                utils.category.getAll.setData(undefined, context.previousCategories);
            }
            // Reopen edit mode
            if (context?.editingIdSnapshot) {
                setEditingId(context.editingIdSnapshot);
                setEditCategory(context.editCategorySnapshot);
            }
            toast.error(error.message || 'Failed to update category');
        },
    });

    const deleteCategory = trpc.category.delete.useMutation({
        onMutate: async (variables) => {
            await utils.category.getAll.cancel();
            const previousCategories = utils.category.getAll.getData();

            // Optimistically remove from cache
            utils.category.getAll.setData(undefined, (old) => {
                if (!old) return old;
                return old.filter(cat => cat.id !== variables.id);
            });

            setDeleteConfirm(null);

            return { previousCategories };
        },
        onSuccess: () => {
            toast.success('Category deleted');
        },
        onError: (error, variables, context) => {
            // Roll back on error
            if (context?.previousCategories) {
                utils.category.getAll.setData(undefined, context.previousCategories);
            }
            toast.error(error.message || 'Failed to delete category');
        },
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (name: string, isNew: boolean) => {
        const slug = generateSlug(name);
        if (isNew) {
            setNewCategory({ ...newCategory, name, slug });
        } else {
            setEditCategory({ ...editCategory, name, slug });
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.name.trim()) {
            toast.error('Category name is required');
            return;
        }
        createCategory.mutate({
            name: newCategory.name.trim(),
            slug: newCategory.slug || generateSlug(newCategory.name),
            description: newCategory.description.trim() || undefined,
        });
    };

    const handleStartEdit = (category: Category) => {
        setEditingId(category.id);
        setEditCategory({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
        });
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        if (!editCategory.name.trim()) {
            toast.error('Category name is required');
            return;
        }
        updateCategory.mutate({
            id: editingId,
            name: editCategory.name.trim(),
            slug: editCategory.slug || generateSlug(editCategory.name),
            description: editCategory.description.trim() || null,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditCategory({ name: '', slug: '', description: '' });
    };

    const handleDelete = (id: string) => {
        deleteCategory.mutate({ id });
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 h-14 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Service Categories</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Organize your services into categories for easier navigation
                    </p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {/* Add New Category Row */}
                {isAdding && (
                    <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => handleNameChange(e.target.value, true)}
                                placeholder="Category name"
                                className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                autoFocus
                            />
                            <input
                                type="text"
                                value={newCategory.slug}
                                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                placeholder="url-slug"
                                className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono text-xs"
                            />
                            <input
                                type="text"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                placeholder="Description (optional)"
                                className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleAddCategory}
                                disabled={createCategory.isPending}
                                className="p-1.5 text-teal-600 hover:bg-teal-100 rounded transition-colors disabled:opacity-50"
                                title="Save"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewCategory({ name: '', slug: '', description: '' });
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Cancel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Categories */}
                {categories && categories.length > 0 ? (
                    categories.map((category) => (
                        <div
                            key={category.id}
                            className={`flex items-center gap-3 p-3 bg-white border rounded-lg transition-all duration-300 ${
                                recentlyAddedId === category.id
                                    ? 'border-teal-400 bg-teal-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {editingId === category.id ? (
                                <>
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            value={editCategory.name}
                                            onChange={(e) => handleNameChange(e.target.value, false)}
                                            className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                        <input
                                            type="text"
                                            value={editCategory.slug}
                                            onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                                            className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono text-xs"
                                        />
                                        <input
                                            type="text"
                                            value={editCategory.description}
                                            onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                                            className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={updateCategory.isPending}
                                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors disabled:opacity-50"
                                            title="Save"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                            title="Cancel"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{category.name}</span>
                                            <span className="text-xs text-gray-400 font-mono">/{category.slug}</span>
                                        </div>
                                        {category.description && (
                                            <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {deleteConfirm === category.id ? (
                                            <>
                                                <span className="text-xs text-red-600 mr-1">Delete?</span>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    disabled={deleteCategory.isPending}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Confirm delete"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(category)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(category.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="text-center py-8 text-gray-500">
                            <p className="mb-2">No categories yet</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Create your first category
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
