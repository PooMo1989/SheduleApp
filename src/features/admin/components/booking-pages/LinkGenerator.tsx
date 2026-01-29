'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, ExternalLink, Link as LinkIcon } from 'lucide-react';

interface LinkGeneratorProps {
    services: { id: string; name: string }[];
    providers: { id: string; name: string; serviceIds: string[] }[];
    tenantSlug: string;
}

export function LinkGenerator({ services, providers, tenantSlug }: LinkGeneratorProps) {
    const [selectedService, setSelectedService] = useState<string>('all');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');

    const generatedLink = useMemo(() => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.shedule.com';

        const params = new URLSearchParams();
        if (selectedService !== 'all') params.append('service', selectedService);
        if (selectedProvider !== 'all') params.append('provider', selectedProvider);

        return `${baseUrl}/book/${tenantSlug}${params.toString() ? `?${params.toString()}` : ''}`;
    }, [selectedService, selectedProvider, tenantSlug]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        toast.success('Link copied to clipboard');
    };

    const handleOpen = () => {
        window.open(generatedLink, '_blank');
    };

    const filteredProviders = selectedService === 'all'
        ? providers
        : providers.filter(p => p.serviceIds.includes(selectedService));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Pre-select Service</Label>
                        <Select value={selectedService} onValueChange={(val) => {
                            setSelectedService(val);
                            setSelectedProvider('all');
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Services" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">No Selection (Client Chooses)</SelectItem>
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
                                <SelectValue placeholder="All Providers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">No Selection (Client Chooses)</SelectItem>
                                {filteredProviders.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Output */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Shareable Link</Label>
                        <div className="flex gap-2">
                            <Input value={generatedLink} readOnly className="font-mono text-sm" />
                            <Button variant="outline" size="icon" onClick={handleCopy} title="Copy Link">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleOpen} title="Test Link">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-neutral-500 pt-1">
                            Share this link via email, SMS, or social media.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <LinkIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium mb-1">Direct Link Features</p>
                                <ul className="list-disc pl-4 space-y-1 text-blue-700">
                                    <li>Works on mobile and desktop</li>
                                    <li>Pre-fills your choices automatically</li>
                                    <li>Clients can bookmark this URL</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
