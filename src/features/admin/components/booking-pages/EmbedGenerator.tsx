'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Copy, Code } from 'lucide-react';

interface EmbedGeneratorProps {
    services: { id: string; name: string }[];
    providers: { id: string; name: string; serviceIds: string[] }[];
    tenantSlug: string;
}

export function EmbedGenerator({ services, providers, tenantSlug }: EmbedGeneratorProps) {
    const [selectedService, setSelectedService] = useState<string>('all');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');
    const [theme, setTheme] = useState<'light' | 'dark' | 'minimal'>('light');

    // Compute embed code from selections
    const embedCode = useMemo(() => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.shedule.com';

        const params = new URLSearchParams();
        if (selectedService !== 'all') params.append('service', selectedService);
        if (selectedProvider !== 'all') params.append('provider', selectedProvider);
        if (theme !== 'light') params.append('theme', theme);

        const url = `${baseUrl}/book/${tenantSlug}${params.toString() ? `?${params.toString()}` : ''}`;
        return `<iframe src="${url}" width="100%" height="600px" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></iframe>`;
    }, [selectedService, selectedProvider, theme, tenantSlug]);

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode);
        toast.success('Embed code copied to clipboard');
    };

    const filteredProviders = selectedService === 'all'
        ? providers
        : providers.filter(p => p.serviceIds.includes(selectedService));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration Column */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Filter by Service</Label>
                        <Select value={selectedService} onValueChange={(val) => {
                            setSelectedService(val);
                            setSelectedProvider('all'); // Reset provider when service changes
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Services</SelectItem>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Pre-select Provider</Label>
                        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Providers (Auto-assign)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Providers (Auto-assign)</SelectItem>
                                {filteredProviders.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select value={theme} onValueChange={(val) => setTheme(val as 'light' | 'dark' | 'minimal')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light (Default)</SelectItem>
                                <SelectItem value="dark">Dark Mode</SelectItem>
                                <SelectItem value="minimal">Minimal (No Border/Shadow)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Embed Code</Label>
                        <div className="relative">
                            <pre className="p-4 bg-slate-950 text-slate-50 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono min-h-[160px]">
                                {embedCode}
                            </pre>
                            <Button
                                size="sm"
                                className="absolute top-2 right-2 bg-white text-slate-900 hover:bg-slate-100"
                                onClick={handleCopy}
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Code
                            </Button>
                        </div>
                        <p className="text-xs text-neutral-500 pt-1">
                            Paste this code into your website&apos;s HTML where you want the booking widget to appear.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                    <Code className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-medium">Live Preview</h4>
                </div>
                <div
                    className="w-full border rounded-xl overflow-hidden bg-slate-50"
                    style={{ height: '600px' }}
                >
                    <iframe
                        src={`${typeof window !== 'undefined' ? window.location.origin : ''}/book/${tenantSlug}${(() => {
                            const params = new URLSearchParams();
                            if (selectedService !== 'all') params.append('service', selectedService);
                            if (selectedProvider !== 'all') params.append('provider', selectedProvider);
                            if (theme !== 'light') params.append('theme', theme);
                            return params.toString() ? `?${params.toString()}` : '';
                        })()}`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="Widget Preview"
                    />
                </div>
            </div>
        </div>
    );
}
