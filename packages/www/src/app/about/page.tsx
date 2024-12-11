import Hero from "@/component/hero";
import {GITHUB_URL} from "@/data/env";
import Link from "next/link";

export default function About() {
    return (
        <Hero title="About BrewDocs" className="max-lg:pt-[8rem]">
            <div className="lg:max-w-screen-md p-4 text-left [&>p]:mt-3 [&>p]:indent-4 lg:text-lg flex flex-col">
                <p>BrewDocs is a homebrewing documentation tool designed for beginner and hobbyist homebrewers. It simplifies the process of organizing and recording your brew days, while offering easy access to educational resources.</p>

                <p>Designed for offline use, BrewDocs keeps the resources you need most ready at-hand.</p>

                <p>If you're interested in the technical side of BrewDocs, head over to its public Github <Link className="link link-primary" href={GITHUB_URL}>repository</Link> to learn more.</p>
                {/*<p>Additionally, the software follows an <b>offline-first</b> approach. The aim is to provide fast, on-demand information as well as keeping operating costs down. Think of it as a digital booklet.</p>*/}
                {/*<p>Built as a technical demonstration, BrewDocs showcases the use of modern web technologies like <b>Next.js</b>. <b>React</b>, <b>Tailwind</b>, and <b>Daisy UI</b> to create a streamlined and user-friendly experience.</p>*/}
                {/*<p className="italic max-lg:text-sm">Note: BrewDocs is currently in its prototyping stage. It is deployed mostly for demonstration and is not stable yet.</p>*/}
                {/*<a href={APP_URL} className="btn btn-ghost self-center">View the app</a>*/}
            </div>
        </Hero>
    )
}