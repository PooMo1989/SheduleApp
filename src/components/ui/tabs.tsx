'use client';

import * as React from "react"

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void }>({
    value: "",
    onValueChange: () => { },
})

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string; value?: string; onValueChange?: (value: string) => void }
>(({ className, defaultValue, value: controlledValue, onValueChange, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "")
    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

    const handleValueChange = (newValue: string) => {
        if (controlledValue === undefined) {
            setUncontrolledValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div ref={ref} className={className} {...props} />
        </TabsContext.Provider>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 ${className || ""}`}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context.value === value

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => context.onValueChange(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
            ${isActive ? "bg-white text-slate-950 shadow-sm" : "hover:bg-slate-200 hover:text-slate-900"}
            ${className || ""}`}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (context.value !== value) return null

    return (
        <div
            ref={ref}
            className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${className || ""}`}
            {...props}
        />
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
