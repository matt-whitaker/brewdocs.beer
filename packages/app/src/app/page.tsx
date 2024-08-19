import Hero from "@/component/hero";
import Shell from "@/component/shell";

export default function Home() {
    return (
        <Shell>
            <Hero>
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold mb-5">Welcome back!</h1>
                    [Cool HUD / Dashboard]
                </div>
            </Hero>
        </Shell>
    );
}
