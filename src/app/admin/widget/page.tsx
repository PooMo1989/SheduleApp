import { Code2, Copy } from 'lucide-react';

export default function AdminWidgetPage() {
    const embedCode = `<iframe 
  src="https://your-domain.com/embed/book?service=SERVICE_ID&provider=PROVIDER_ID"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Widget Configuration</h1>
                <p className="text-neutral-600 mt-1">
                    Generate embed codes to add booking to your website.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Code2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Embed Code
                        </h2>
                        <p className="text-sm text-neutral-500">
                            Copy and paste this into your website
                        </p>
                    </div>
                </div>

                <div className="bg-neutral-900 rounded-lg p-4 relative">
                    <pre className="text-sm text-green-400 overflow-x-auto">
                        <code>{embedCode}</code>
                    </pre>
                    <button
                        className="absolute top-3 right-3 p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
                        title="Copy to clipboard"
                    >
                        <Copy className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>

                <p className="mt-4 text-sm text-neutral-500">
                    <strong>Note:</strong> Widget configuration UI will be fully implemented in Epic 3 (Story 3.2).
                    Currently showing a preview of the embed code format.
                </p>
            </div>
        </div>
    );
}
