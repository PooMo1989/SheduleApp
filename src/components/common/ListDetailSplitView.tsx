'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ListDetailSplitViewProps {
    list: ReactNode;
    detail: ReactNode | null;
    onClose: () => void;
}

export function ListDetailSplitView({ list, detail, onClose }: ListDetailSplitViewProps) {
    const isOpen = !!detail;

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* List Pane */}
            <div
                className={`
                    h-full overflow-y-auto transition-all duration-200 ease-out
                    ${detail
                        ? 'hidden md:block md:w-[35%] md:border-r md:border-neutral-200'
                        : 'w-full'
                    }
                `}
            >
                {list}
            </div>

            {/* Detail Pane - Desktop (slide-in) */}
            {detail && (
                <div
                    className={`
                        hidden md:flex md:flex-col h-full overflow-y-auto
                        transition-all duration-200 ease-out
                        ${isOpen ? 'md:w-[65%] opacity-100' : 'md:w-0 opacity-0'}
                    `}
                >
                    <div className="sticky top-0 z-10 flex items-center justify-end p-3 border-b border-neutral-200 bg-white">
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                            aria-label="Close detail view"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {detail}
                    </div>
                </div>
            )}

            {/* Detail Pane - Mobile (full-screen overlay) */}
            {detail && (
                <div
                    className={`
                        fixed inset-0 z-50 bg-white flex flex-col md:hidden
                        transition-transform duration-200 ease-out
                        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}
                >
                    <div className="sticky top-0 z-10 flex items-center justify-between p-3 border-b border-neutral-200 bg-white">
                        <span className="text-sm font-medium text-neutral-500">Details</span>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                            aria-label="Close detail view"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {detail}
                    </div>
                </div>
            )}
        </div>
    );
}
