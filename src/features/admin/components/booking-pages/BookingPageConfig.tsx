'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { Loader2 } from 'lucide-react';
import { EmbedGenerator } from './EmbedGenerator';
import { LinkGenerator } from './LinkGenerator';

export function BookingPageConfig() {
    // Fetch real data to populate dropdowns
    const { data: services, isLoading: isLoadingServices } = trpc.service.getAll.useQuery();
    const { data: providers, isLoading: isLoadingProviders } = trpc.provider.getAll.useQuery();

    if (isLoadingServices || isLoadingProviders) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
        );
    }

    // Map data for generators
    const serviceList = services?.map(s => ({ id: s.id, name: s.name })) || [];

    // For providers, we'd ideally want to know their assigned services to filter correctly.
    // Assuming provider.list returns basic info. If we need assignments, we might need a dedicated query later.
    // For now, MVP: List all providers.
    const providerList = providers?.map(p => ({
        id: p.id,
        name: p.name,
        serviceIds: [] // Placeholder until we fetch assignments or include them in list query
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Booking Pages</h2>
                    <p className="text-slate-500">Create embed codes and direct links for your clients.</p>
                </div>
            </div>

            <Tabs defaultValue="embed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="embed">Embed Widget</TabsTrigger>
                    <TabsTrigger value="link">Direct Link</TabsTrigger>
                </TabsList>

                <TabsContent value="embed" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Website Widget</CardTitle>
                            <CardDescription>
                                Configure an iframe widget to embed on your existing website (Wordpress, Squarespace, Wix, etc).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EmbedGenerator services={serviceList} providers={providerList} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="link" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Shareable Link</CardTitle>
                            <CardDescription>
                                Generate a direct URL to send to clients via email, SMS, or social media.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LinkGenerator services={serviceList} providers={providerList} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
