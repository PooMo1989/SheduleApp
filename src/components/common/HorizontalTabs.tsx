'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface Tab {
    id: string;
    label: string;
    content: ReactNode;
}

interface HorizontalTabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
}

export function HorizontalTabs({ tabs, defaultTab, onChange }: HorizontalTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
    const tabsRef = useRef<HTMLDivElement>(null);
    const [showOverflow, setShowOverflow] = useState(false);

    useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;

        const checkOverflow = () => {
            setShowOverflow(el.scrollWidth > el.clientWidth);
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [tabs]);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    const activeContent = tabs.find(t => t.id === activeTab)?.content;

    return (
        <div className="flex flex-col h-full">
            {/* Tab Bar */}
            <div className="relative border-b border-neutral-200">
                <div
                    ref={tabsRef}
                    className="flex overflow-x-auto scrollbar-hide"
                    role="tablist"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`
                                px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                                border-b-2 -mb-px
                                ${activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {/* Overflow indicator */}
                {showOverflow && (
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto" role="tabpanel">
                {activeContent}
            </div>
        </div>
    );
}
