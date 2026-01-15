export function GlassBackground({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                backgroundImage:
                    "url('https://img.freepik.com/free-photo/vivid-blurred-colorful-wallpaper-background_58702-3798.jpg?t=st=1755198182~exp=1755201782~hmac=2b0ddcb610b3af95302752c6e95abe103b212da84327f1242d67ea7cc2501a4e&w=1480')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            className="max-w-screen h-screen backdrop-blur-3xl"
        >
            <div
                className="bg-background-muted opacity-95"
                suppressHydrationWarning
            >
                {children}
            </div>
        </div>
    )
}
