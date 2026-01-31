'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { ServiceListSidebar } from './ServiceListSidebar';
import { ServiceInfoPane } from './ServiceInfoPane';
import { ServiceFormSlideIn } from './ServiceFormSlideIn';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ServiceToDelete {
    id: string;
    name: string;
}

/**
 * Services Page Layout
 * Expandable split-view: Services list (full width initially) + Edit form (slides in)
 * - List is full width when nothing selected
 * - Clicking service/create → list shrinks, form slides in
 * - Clicking different service → form updates instantly
 */
type PendingAction =
    | { type: 'create' }
    | { type: 'edit'; serviceId: string }
    | { type: 'close' };

export function ServicesPageLayout() {
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
    const [unsavedConfirm, setUnsavedConfirm] = useState<{ open: boolean; action: PendingAction | null }>({
        open: false,
        action: null,
    });
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; service: ServiceToDelete | null }>({
        open: false,
        service: null,
    });

    // Admin sees all services (including inactive)
    const { data: services, isLoading } = trpc.service.getAll.useQuery({
        includeInactive: true,
    });

    // Fetch categories for filtering
    const { data: categories } = trpc.category.getAll.useQuery();

    const utils = trpc.useUtils();

    // Delete service mutation
    const deleteService = trpc.service.delete.useMutation({
        onMutate: async (variables) => {
            // Cancel any outgoing refetches to prevent race conditions
            await utils.service.getAll.cancel();

            // Snapshot the previous value for rollback
            const previousServices = utils.service.getAll.getData({ includeInactive: true });

            // Optimistically remove from cache immediately
            utils.service.getAll.setData({ includeInactive: true }, (old) =>
                old?.filter(s => s.id !== variables.id)
            );

            return { previousServices };
        },
        onSuccess: () => {
            toast.success('Service deleted');
            // Clear selection if the deleted service was selected
            if (deleteConfirm.service && selectedServiceId === deleteConfirm.service.id) {
                setSelectedServiceId(null);
                setIsCreating(false);
                setHasUnsavedChanges(false);
            }
            setDeleteConfirm({ open: false, service: null });
        },
        onError: (error, variables, context) => {
            // If service not found, it's already deleted - don't rollback, just clean up
            if (error.message?.includes('not found') || error.data?.code === 'NOT_FOUND') {
                toast.info('Service was already deleted');
                // Remove from cache since it doesn't exist
                utils.service.getAll.setData({ includeInactive: true }, (old) =>
                    old?.filter(s => s.id !== variables.id)
                );
            } else {
                // Real error - rollback
                if (context?.previousServices) {
                    utils.service.getAll.setData({ includeInactive: true }, context.previousServices);
                }
                toast.error(error.message || 'Failed to delete service');
            }
            setDeleteConfirm({ open: false, service: null });
        },
    });

    const handleCreateNew = () => {
        // Check for unsaved changes before creating new service
        if (hasUnsavedChanges && (selectedServiceId || isCreating)) {
            setUnsavedConfirm({ open: true, action: { type: 'create' } });
        } else {
            // No unsaved changes, create new service immediately
            setSelectedServiceId(null);
            setIsCreating(true);
        }
    };

    const handleEditService = (serviceId: string) => {
        // Check for unsaved changes before switching
        if (hasUnsavedChanges && selectedServiceId !== serviceId) {
            setUnsavedConfirm({ open: true, action: { type: 'edit', serviceId } });
        } else {
            // No unsaved changes, switch immediately
            setSelectedServiceId(serviceId);
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        // Check for unsaved changes before closing
        if (hasUnsavedChanges) {
            setUnsavedConfirm({ open: true, action: { type: 'close' } });
        } else {
            setIsCreating(false);
            setSelectedServiceId(null);
        }
    };

    const confirmUnsavedDiscard = () => {
        const action = unsavedConfirm.action;
        if (!action) return;

        setHasUnsavedChanges(false);
        setUnsavedConfirm({ open: false, action: null });

        switch (action.type) {
            case 'create':
                setSelectedServiceId(null);
                setIsCreating(true);
                break;
            case 'edit':
                setSelectedServiceId(action.serviceId);
                setIsCreating(false);
                break;
            case 'close':
                setIsCreating(false);
                setSelectedServiceId(null);
                break;
        }
    };

    const cancelUnsavedDiscard = () => {
        setUnsavedConfirm({ open: false, action: null });
    };

    const handleServiceCreated = (serviceId: string) => {
        setIsCreating(false);
        setSelectedServiceId(serviceId);
    };

    // Delete handlers
    const handleDeleteService = (service: ServiceToDelete) => {
        setDeleteConfirm({ open: true, service });
    };

    const confirmDelete = () => {
        if (deleteConfirm.service) {
            deleteService.mutate({ id: deleteConfirm.service.id });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ open: false, service: null });
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Esc to close
            if (e.key === 'Escape' && (selectedServiceId || isCreating)) {
                handleClose();
            }
            // Cmd/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('service-search')?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedServiceId, isCreating]);

    const showForm = isCreating || !!selectedServiceId;
    const hasServices = !!(services && services.length > 0);

    // Filter services by search query and category
    const filteredServices = services?.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategoryId || service.category_id === selectedCategoryId;
        return matchesSearch && matchesCategory;
    });

    // Get selected category name for display
    const selectedCategory = categories?.find(c => c.id === selectedCategoryId);

    return (
        <div className={`flex overflow-hidden h-full ${showForm ? 'bg-gray-50' : 'bg-white'}`}>
            {/* Left Pane - Services List (Expandable) */}
            <div
                className={`flex flex-col transition-all duration-300 ease-in-out h-full ${
                    showForm ? 'w-[550px] border-r border-gray-200 bg-white' : 'w-full'
                }`}
            >
                {/* Header */}
                <div className={`p-6 flex-shrink-0 ${showForm ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {hasServices
                                    ? (searchQuery || selectedCategoryId) && filteredServices
                                        ? `${filteredServices.length} of ${services.length} service${services.length === 1 ? '' : 's'}`
                                        : `${services.length} service${services.length === 1 ? '' : 's'}`
                                    : 'Get started by creating your first service'}
                            </p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={handleCreateNew}
                                className="px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Service
                            </button>
                        )}
                    </div>

                    {/* Search and Filter */}
                    {hasServices && (
                        <div className="space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="service-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search services..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            {categories && categories.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <button
                                        onClick={() => setSelectedCategoryId(null)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                            !selectedCategoryId
                                                ? 'bg-teal-100 text-teal-700 border border-teal-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                        }`}
                                    >
                                        All
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                                selectedCategoryId === category.id
                                                    ? 'bg-teal-100 text-teal-700 border border-teal-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Compact Header when form is open */}
                    {showForm && (
                        <button
                            onClick={handleCreateNew}
                            className="w-full mt-3 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Service
                        </button>
                    )}
                </div>

                {/* Services List */}
                <div className={`flex-1 overflow-y-auto min-h-0 ${showForm ? '' : 'bg-gray-50'}`}>
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-24 bg-gray-100 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : !hasServices ? (
                        <div className="flex items-center justify-center h-full p-8">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Create your first service to start accepting bookings from clients
                                </p>
                                <button
                                    onClick={handleCreateNew}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Your First Service
                                </button>
                            </div>
                        </div>
                    ) : filteredServices && filteredServices.length > 0 ? (
                        <ServiceListSidebar
                            services={filteredServices}
                            selectedServiceId={selectedServiceId}
                            onSelectService={handleEditService}
                            onDeleteService={handleDeleteService}
                            isCompact={showForm}
                        />
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">
                                No services match {searchQuery && selectedCategoryId ? 'your search and filter' : searchQuery ? 'your search' : 'this category'}
                            </p>
                            <div className="mt-2 flex items-center justify-center gap-2">
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-sm text-teal-600 hover:text-teal-700"
                                    >
                                        Clear search
                                    </button>
                                )}
                                {searchQuery && selectedCategoryId && (
                                    <span className="text-gray-300">|</span>
                                )}
                                {selectedCategoryId && (
                                    <button
                                        onClick={() => setSelectedCategoryId(null)}
                                        className="text-sm text-teal-600 hover:text-teal-700"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Hint */}
                {showForm && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <p className="text-xs text-gray-500 text-center">
                            Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Esc</kbd> to close
                        </p>
                    </div>
                )}
            </div>

            {/* Right Pane - Edit Form (slides in) */}
            {showForm && (
                <div className="flex-1 overflow-hidden ml-6">
                    <ServiceFormSlideIn
                        serviceId={selectedServiceId}
                        isCreating={isCreating}
                        onClose={handleClose}
                        onServiceCreated={handleServiceCreated}
                        onUnsavedChangesChange={setHasUnsavedChanges}
                    />
                </div>
            )}

            {/* Unsaved Changes Confirmation Dialog */}
            <Dialog open={unsavedConfirm.open} onOpenChange={(open) => !open && cancelUnsavedDiscard()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mt-2">
                        You have unsaved changes. Do you want to discard them?
                    </p>
                    <DialogFooter className="mt-6 gap-2">
                        <Button variant="outline" onClick={cancelUnsavedDiscard}>
                            Keep Editing
                        </Button>
                        <Button variant="destructive" onClick={confirmUnsavedDiscard}>
                            Discard Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Service Confirmation Dialog */}
            <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && cancelDelete()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Service</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mt-2">
                        Are you sure you want to permanently delete <strong>&quot;{deleteConfirm.service?.name}&quot;</strong>?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        This will remove all schedules, bookings, and cannot be undone.
                    </p>
                    <DialogFooter className="mt-6 gap-2">
                        <Button variant="outline" onClick={cancelDelete} disabled={deleteService.isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteService.isPending}
                        >
                            {deleteService.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
