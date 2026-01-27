'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Undo } from 'lucide-react';
import { toast } from 'sonner';

type EventType = 'booking_confirmation' | 'booking_cancellation' | 'provider_notification';

const EVENT_TYPES: { value: EventType; label: string; variables: string[] }[] = [
    {
        value: 'booking_confirmation',
        label: 'Booking Confirmation (Client)',
        variables: ['{{client_name}}', '{{service_name}}', '{{date}}', '{{time}}', '{{provider_name}}', '{{location}}']
    },
    {
        value: 'booking_cancellation',
        label: 'Booking Cancellation (Client)',
        variables: ['{{client_name}}', '{{service_name}}', '{{date}}', '{{time}}']
    },
    {
        value: 'provider_notification',
        label: 'New Booking Notification (Provider)',
        variables: ['{{provider_name}}', '{{client_name}}', '{{service_name}}', '{{date}}', '{{time}}']
    },
];

const DEFAULT_TEMPLATES: Record<EventType, { subject: string; body: string }> = {
    booking_confirmation: {
        subject: 'Appointment Confirmed: {{service_name}}',
        body: 'Hi {{client_name}},\n\nYour appointment for {{service_name}} on {{date}} at {{time}} is confirmed.\n\nProvider: {{provider_name}}\nLocation: {{location}}\n\nSee you there!'
    },
    booking_cancellation: {
        subject: 'Appointment Cancelled: {{service_name}}',
        body: 'Hi {{client_name}},\n\nYour appointment for {{service_name}} on {{date}} at {{time}} has been cancelled.\n\nPlease visit our website to reschedule if needed.'
    },
    provider_notification: {
        subject: 'New Booking: {{service_name}}',
        body: 'Hi {{provider_name}},\n\nYou received a new booking.\n\nClient: {{client_name}}\nService: {{service_name}}\nDate: {{date}}\nTime: {{time}}'
    },
};

/**
 * Sub-component for editing a specific template.
 * Using this separate component with a `key` prop allows us to reset state
 * automatically when the event type changes, without using useEffect.
 */
function EmailTemplateEditor({
    eventType,
    initialSubject,
    initialBody,
    onSave
}: {
    eventType: EventType;
    initialSubject: string;
    initialBody: string;
    onSave: (subject: string, body: string) => void;
}) {
    const [subject, setSubject] = useState(initialSubject);
    const [body, setBody] = useState(initialBody);
    const [isDirty, setIsDirty] = useState(false);

    const saveMutation = trpc.admin.email.saveTemplate.useMutation({
        onSuccess: () => {
            toast.success('Template saved successfully');
            setIsDirty(false);
            onSave(subject, body);
        },
        onError: (err) => {
            toast.error('Failed to save template: ' + err.message);
        }
    });

    const handleSave = () => {
        saveMutation.mutate({
            eventType,
            subject,
            body,
        });
    };

    const handleReset = () => {
        if (confirm('Reset to default template? This will discard your custom changes.')) {
            const defaults = DEFAULT_TEMPLATES[eventType];
            setSubject(defaults.subject);
            setBody(defaults.body);
            setIsDirty(true);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Template</CardTitle>
                <CardDescription>
                    Customize the subject and body for <strong>{EVENT_TYPES.find(e => e.value === eventType)?.label}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => {
                            setSubject(e.target.value);
                            setIsDirty(true);
                        }}
                        placeholder="Enter email subject"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="body">Email Body</Label>
                    <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => {
                            setBody(e.target.value);
                            setIsDirty(true);
                        }}
                        placeholder="Enter email content..."
                        className="min-h-[300px] font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                        Supports plain text. Markdown support coming soon.
                    </p>
                </div>
            </CardContent>
            <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-lg">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-gray-500"
                >
                    <Undo className="w-4 h-4 mr-2" />
                    Reset to Default
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || saveMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                >
                    {saveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>
        </Card>
    );
}

/**
 * Settings Notifications Tab
 * Configures email templates and notification settings.
 * Story 2.8.7 / Story 8.4
 */
export function SettingsNotificationsTab() {
    const [selectedEvent, setSelectedEvent] = useState<EventType>('booking_confirmation');

    // Fetch existing template
    const { data: template, isLoading, refetch } = trpc.admin.email.getTemplate.useQuery({
        eventType: selectedEvent,
    }, {
        refetchOnWindowFocus: false,
    });

    const currentvariables = EVENT_TYPES.find(e => e.value === selectedEvent)?.variables || [];

    // Determine initial values
    const defaults = DEFAULT_TEMPLATES[selectedEvent];
    const initialSubject = template?.subject_template || defaults.subject;
    const initialBody = template?.body_template || defaults.body;

    return (
        <div className="space-y-6 max-w-4xl py-2">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Configure automated email templates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Selection Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Select Template</CardTitle>
                            <CardDescription>Choose an email type to customize</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {EVENT_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedEvent(type.value)}
                                    className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors ${selectedEvent === type.value
                                        ? 'bg-teal-50 text-teal-700 border-teal-200 border font-medium'
                                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Available Variables</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {currentvariables.map((v) => (
                                    <code key={v} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                        {v}
                                    </code>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2">
                    {isLoading ? (
                        <div className="flex justify-center py-12 h-full items-center bg-white rounded-lg border">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <EmailTemplateEditor
                            key={`${selectedEvent}-${template ? 'loaded' : 'default'}`} // Force remount on change
                            eventType={selectedEvent}
                            initialSubject={initialSubject}
                            initialBody={initialBody}
                            onSave={() => refetch()}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
