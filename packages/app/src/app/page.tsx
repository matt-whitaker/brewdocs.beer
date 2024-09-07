import Hero from "@/component/hero";

export default function HomePage() {
    return (
        <Hero>
            <div className="max-w-md">
                <h1 className="text-5xl font-bold mb-5">Welcome back!</h1>
                <b className="hidden lg:block">Note: Best used on mobile</b>
                {/*[Cool HUD / Dashboard]*/}
            </div>
        </Hero>
    );
}
