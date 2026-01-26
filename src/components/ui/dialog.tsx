import * as React from "react"
import { X } from "lucide-react"

const DialogContext = React.createContext<{ open: boolean, onOpenChange: (open: boolean) => void }>({
    open: false,
    onOpenChange: () => { },
})

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
        if (open !== undefined) setIsOpen(open)
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    return (
        <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const { open, onOpenChange } = React.useContext(DialogContext)
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`relative w-full bg-white rounded-lg shadow-lg p-6 ${className || ""}`}>
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    )
}

const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ""}`}>
        {children}
    </div>
)

const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ""}`}>
        {children}
    </div>
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}
            {...props}
        />
    )
)
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle }
