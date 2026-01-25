'use client';

/**
 * Settings Permissions Tab (Placeholder)
 * Story 2.8.7: Default permission sets and role configuration
 */
export function SettingsPermissionsTab() {
    return (
        <div className="p-6 max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Role Permissions</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Configure default permission sets for each role
                </p>

                {/* Placeholder Content */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-2">Coming Soon</p>
                    <p className="text-sm text-gray-500">
                        Default role permissions configuration will be available here.
                        Currently, permissions are managed per team member in the Team page.
                    </p>
                </div>

                {/* Preview of current roles */}
                <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Current Roles:</h4>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-purple-700 text-xs font-bold">O</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Owner</p>
                                <p className="text-sm text-gray-500">Full access to all features and settings</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-teal-700 text-xs font-bold">A</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Admin</p>
                                <p className="text-sm text-gray-500">Manage services, team, and view reports</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-700 text-xs font-bold">P</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Provider</p>
                                <p className="text-sm text-gray-500">View own schedule and manage own clients</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Planned features */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Planned Features:</h4>
                    <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Default permission templates for each role
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Custom role creation
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Granular permission controls
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
