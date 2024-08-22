import Hero from "@/component/hero";
import {APP_URL} from "@/data/env";

export default function About() {
    return (
        <Hero title="About BrewDocs" className="max-lg:pt-16">
            <div className="lg:w-screen-md p-4 text-left [&>p]:mt-3 [&>p]:indent-4 lg:text-lg flex flex-col">
                <p>BrewDocs is a lightweight documentation tool designed for beginner and hobbyist homebrewers. It simplifies the process of organizing and recording homebrew recipes while offering an educational resource for the brewing process.</p>
                <p>Built as a technical demonstration, BrewDocs showcases the use of modern web technologies, leveraging <b>React</b>, <b>Next.js</b>, <b>Tailwind</b>, and <b>Daisy UI</b> to create a streamlined and user-friendly experience.</p>
                <p className="italic max-lg:text-sm">Note: BrewDocs is currently in its prototyping stage and deployed for demo purposes only.</p>
                <a href={APP_URL} className="btn btn-ghost self-center">View the app</a>
            </div>
        </Hero>
    )
}