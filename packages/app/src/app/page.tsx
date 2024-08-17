import Hero from "@/component/hero";
import Shell from "@/component/shell";

export default async function Home() {
    return (
        <Shell>
            <Hero>
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Welcome to BrewDocs!</h1>
                    <p className="py-6">
                        BrewDocs is a digital homebrewer handbook, toolkit, and brew day application.
                    </p>
                </div>
            </Hero>
        </Shell>
    );
}
