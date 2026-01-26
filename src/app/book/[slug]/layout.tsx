export default function BookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
