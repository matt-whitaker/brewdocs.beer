import Hero from "@/component/hero";
import {features} from "@/data/features";

export default function Features() {
    return (
        <Hero title="Features" className="max-lg:pt-16 overflow-hidden">
            <p>BrewDocs is in an early, highly iterative prototyping phase. It's focus is largely on the basics to provide a platform for broader feature development. Below you can find a list of the current set of capabilities.</p>
            <div className="content-start grid-flow-col lg:columns-5 columns-2 mt-4">
                {features.map(([item, done]) => (
                    <label key={item} title={item} className="box-border lg:py-2 py-1 flex items-center justify-start lg:text-md text-sm overflow-hidden whitespace-nowrap overflow-ellipsis">
                        <input readOnly checked={!!done} type="checkbox" className="mr-1 disabled checkbox lg:checkbox-md checkbox-sm" />
                        <span>{item}</span>
                    </label>
                ) )}
            </div>
            <p className="lg:text-md text-sm">Something you'd like to see added? A suggestions feature will be added in the future.</p>
        </Hero>
    )
}