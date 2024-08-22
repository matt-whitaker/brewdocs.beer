import Hero from "@/component/hero";
import {roadmap} from "@/data/roadmap";

export default function Roadmap() {
    return (
        <Hero title="Roadmap" className="max-lg:pt-16 overflow-hidden">
            <p>BrewDocs has an exciting journey ahead. Here are some of the key features planned for future updates.</p>
            <div className="content-start grid-flow-col lg:columns-5 columns-2 mt-4">
                {roadmap.map(([item, done]) => (
                    <label key={item} title={item} className="box-border lg:py-2 py-1 flex items-center justify-start lg:text-md text-sm overflow-hidden whitespace-nowrap overflow-ellipsis">
                        <input readOnly checked={!!done} type="checkbox" className="mr-1 disabled checkbox lg:checkbox-md checkbox-sm" />
                        <span>{item}</span>
                    </label>
                ) )}
            </div>
            <p className="lg:text-md text-sm">Something you'd like to see added here? Don't worry, this list will be expanded.</p>
        </Hero>
    )
}