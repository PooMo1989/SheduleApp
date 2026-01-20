'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

interface Branding {
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
}

const DEFAULT_BRANDING: Branding = {
    primary_color: '#0D9488',
    secondary_color: '#5EEAD4',
    background_color: '#FFFFFF',
    text_color: '#1F2937',
};

/**
 * Branding Settings Form
 * Story 2.0: Colors for embed widget and booking pages
 */
export function BrandingForm() {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const { data: settings, isLoading } = trpc.admin.getSettings.useQuery();
    const utils = trpc.useUtils();

    const updateSettings = trpc.admin.updateSettings.useMutation({
        onMutate: () => setSaveStatus('saving'),
        onSuccess: () => {
            setSaveStatus('saved');
            utils.admin.getSettings.invalidate();
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('error'),
    });

    const [colors, setColors] = useState<Branding>(() => {
        if (settings?.branding) {
            return settings.branding as Branding;
        }
        return DEFAULT_BRANDING;
    });

    // Update local state when data loads
    if (settings?.branding && JSON.stringify(colors) === JSON.stringify(DEFAULT_BRANDING)) {
        setColors(settings.branding as Branding);
    }

    const updateColor = (key: keyof Branding, value: string) => {
        setColors(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateSettings.mutate({
            branding: colors,
        });
    };

    const resetToDefaults = () => {
        setColors(DEFAULT_BRANDING);
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />;
    }

    const colorFields: { key: keyof Branding; label: string; description: string }[] = [
        { key: 'primary_color', label: 'Primary Color', description: 'Main brand color (buttons, links)' },
        { key: 'secondary_color', label: 'Secondary Color', description: 'Accent color (highlights, badges)' },
        { key: 'background_color', label: 'Background Color', description: 'Page background' },
        { key: 'text_color', label: 'Text Color', description: 'Main text color' },
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Branding Colors</h3>
                    <p className="text-sm text-gray-500">
                        Customize the colors of your booking widget and pages.
                    </p>
                </div>
                <button
                    onClick={resetToDefaults}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Reset to defaults
                </button>
            </div>

            {/* Color Preview */}
            <div
                className="mb-6 p-4 rounded-lg border"
                style={{
                    backgroundColor: colors.background_color,
                    borderColor: colors.secondary_color,
                }}
            >
                <p
                    className="font-medium mb-2"
                    style={{ color: colors.text_color }}
                >
                    Preview: Your Booking Page
                </p>
                <button
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: colors.primary_color }}
                >
                    Book Now
                </button>
                <span
                    className="ml-3 px-2 py-1 rounded text-xs"
                    style={{
                        backgroundColor: colors.secondary_color,
                        color: colors.text_color,
                    }}
                >
                    Available
                </span>
            </div>

            {/* Color Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {colorFields.map(({ key, label, description }) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors[key]}
                                onChange={e => updateColor(key, e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                                type="text"
                                value={colors[key]}
                                onChange={e => updateColor(key, e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded font-mono uppercase"
                                maxLength={7}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-between">
                <div>
                    {saveStatus === 'saved' && (
                        <span className="text-green-600 text-sm">✓ Branding saved</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-red-600 text-sm">✗ Failed to save</span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Branding'}
                </button>
            </div>
        </div>
    );
}
