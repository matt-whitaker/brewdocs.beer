import Hero from "@/component/hero";
import {roadmap} from "@/data/roadmap";

export default function Roadmap() {
    return (
        <Hero title="Roadmap" className="max-lg:pt-16">
            <p>BrewDocs has an exciting journey ahead. Here are some of the key features planned for future updates.</p>
            <div className="max-w-screen-lg content-start grid-flow-col lg:columns-5 columns-2 lg:w-full mt-4">
                {roadmap.map(([item, done]) => (
                    <label title={item} className="box-border lg:py-2 py-1 flex items-center justify-start lg:text-md text-sm">
                        <input readOnly checked={!!done} type="checkbox" className="mr-1 disabled checkbox lg:checkbox-md checkbox-sm" />
                        <span>{item}</span>
                    </label>
                ) )}
            </div>
            <p className="lg:text-md text-sm">Something you'd like to see added here? Don't worry. The ability to suggest improvements is coming soon...</p>
        </Hero>
    )
}