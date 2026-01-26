import * as React from "react"

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            type="checkbox"
            ref={ref}
            className={`h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-950 ${className || ""}`}
            {...props}
        />
    )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
