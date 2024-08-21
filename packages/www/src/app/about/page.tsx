import Hero from "@/component/hero";

export default function About() {
    return (
        <Hero title="About" className="max-lg:pt-16">
            <div className="max-w-screen-lg p-4 text-left [&>h2]:mt-2 lg:[&>h2]:text-2xl [&>h2]:text-xl lg:[&>p]:text-md [&>p]:text-sm">
                <h2>What is BrewDocs?</h2>
                <p>BrewDocs is a simple, intuitive tool designed for beer enthusiasts to document and organize brewing notes, recipes, and processes. It’s perfect for anyone new to brewing or those who enjoy homebrewing as a hobby.</p>

                <h2>Who is BrewDocs for?</h2>
                <p>BrewDocs is for hobbyist homebrewers and beginners looking to easily track their brewing experiments and learn more about the craft.</p>

                <h2>What makes BrewDocs different?</h2>
                <p>BrewDocs is built with simplicity in mind. It focuses on making the documentation process easy and accessible for anyone, with offline capabilities to ensure you can document your brews anytime, anywhere.</p>

                <h2>Why choose BrewDocs?</h2>
                <p>If you're starting out with homebrewing or enjoy brewing as a hobby, BrewDocs provides an easy way to record and refine your brewing journey.</p>
            </div>
        </Hero>
    )
}