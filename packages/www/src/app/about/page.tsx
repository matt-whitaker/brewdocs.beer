import Hero from "@/component/hero";
import {APP_URL} from "@/data/env";

export default function About() {
    return (
        <Hero title="About BrewDocs" className="max-lg:pt-16">
            <div className="lg:max-w-screen-md p-4 text-left [&>p]:mt-3 [&>p]:indent-4 lg:text-lg flex flex-col">
                <p>BrewDocs is a lightweight documentation tool designed for beginner and hobbyist homebrewers. It simplifies the process of organizing and recording homebrew recipes while offering an educational resource for the brewing process. Designed <b>mobile-first</b>, it is optimized for use while brewing; no need to lug around a laptop.</p>
                <p>Additionally, the software follows an <b>offline-first</b> approach. The aim is to provide fast, on-demand information as well as keeping operating costs down. Think of it as a digital booklet.</p>
                <p>Built as a technical demonstration, BrewDocs showcases the use of modern web technologies: <b>Next.js</b>. <b>React</b>, <b>Tailwind</b>, and <b>Daisy UI</b> to create a streamlined and user-friendly experience.</p>
                <p className="italic max-lg:text-sm">Note: BrewDocs is currently in its prototyping stage and deployed for demo purposes only.</p>
                <a href={APP_URL} className="btn btn-ghost self-center">View the app</a>
            </div>
        </Hero>
    )
}