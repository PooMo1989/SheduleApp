import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        let variantStyles = ""
        switch (variant) {
            case "default": variantStyles = "bg-slate-900 text-white hover:bg-slate-900/90"; break;
            case "destructive": variantStyles = "bg-red-500 text-white hover:bg-red-500/90"; break;
            case "outline": variantStyles = "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900"; break;
            case "secondary": variantStyles = "bg-slate-100 text-slate-900 hover:bg-slate-100/80"; break;
            case "ghost": variantStyles = "hover:bg-slate-100 hover:text-slate-900"; break;
            case "link": variantStyles = "text-slate-900 underline-offset-4 hover:underline"; break;
        }

        let sizeStyles = ""
        switch (size) {
            case "default": sizeStyles = "h-10 px-4 py-2"; break;
            case "sm": sizeStyles = "h-9 rounded-md px-3"; break;
            case "lg": sizeStyles = "h-11 rounded-md px-8"; break;
            case "icon": sizeStyles = "h-10 w-10"; break;
        }

        return (
            <button
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ""}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
