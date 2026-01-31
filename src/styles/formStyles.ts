/**
 * Modern Form Component Styles
 * Reusable Tailwind class strings for consistent, modern form design
 */

export const formStyles = {
    // Container & Layout
    container: 'p-8 space-y-8 max-w-3xl',

    // Sections
    section: 'border-t border-gray-100 pt-8 pb-8 first:border-t-0 first:pt-0',
    sectionHeading: 'text-base font-semibold text-gray-900 mb-6 tracking-tight',

    // Spacing
    fieldGroup: 'space-y-6',
    gridCols2: 'grid grid-cols-2 gap-6',
    gridCols3: 'grid grid-cols-3 gap-6',

    // Labels
    label: 'block text-sm font-medium text-gray-900 mb-2',
    required: 'text-red-500',
    helpText: 'mt-2 text-xs text-gray-600',
    errorText: 'mt-2 text-sm text-red-600',

    // Input Fields
    input: `w-full px-3 py-2.5 border border-gray-200 rounded-lg
        bg-white shadow-sm text-gray-900 text-sm
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
        transition-all duration-150`,

    // Select/Dropdown
    select: `w-full px-3 py-2.5 border border-gray-200 rounded-lg
        bg-white shadow-sm text-gray-900 text-sm
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
        transition-all duration-150`,

    // Textarea
    textarea: `w-full px-3 py-2.5 border border-gray-200 rounded-lg
        bg-white shadow-sm text-gray-900 text-sm
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
        transition-all duration-150 resize-none`,

    // Toggle Switch
    toggleContainer: 'flex items-center justify-between py-3',
    toggleLabel: 'font-medium text-gray-900 text-sm',
    toggleDescription: 'text-sm text-gray-600 mt-0.5',
    toggleSwitch: `w-11 h-6 bg-gray-200 rounded-full
        shadow-inner
        peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300
        peer-checked:bg-teal-600 peer-checked:shadow-none
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border-gray-300 after:border after:rounded-full
        after:h-5 after:w-5 after:transition-all
        peer-checked:after:translate-x-full peer-checked:after:border-white
        transition-all duration-200`,

    // Buttons
    buttonPrimary: `px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg
        shadow-sm hover:bg-teal-700 hover:shadow
        active:shadow-none active:scale-[0.98]
        transition-all duration-150`,

    buttonSecondary: `px-4 py-2.5 border border-gray-200 bg-white text-gray-900 text-sm font-medium rounded-lg
        shadow-sm hover:bg-gray-50 hover:shadow
        active:shadow-none active:scale-[0.98]
        transition-all duration-150`,

    // Small select (for inline use)
    selectSmall: `px-3 py-2 border border-gray-200 rounded-lg text-sm
        bg-white shadow-sm
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
        transition-all duration-150`,

    // Width constraints
    maxWidthXs: 'max-w-xs',
    maxWidthSm: 'max-w-sm',
    maxWidthMd: 'max-w-md',
} as const;

/**
 * Helper function to combine form styles with additional classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
