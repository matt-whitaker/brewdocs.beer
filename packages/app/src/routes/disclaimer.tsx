import {createFileRoute} from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
    component: DisclaimerPage
});

function DisclaimerPage() {
    return (
        <div className="max-w-md p-5">
            <h1 className="font-bold mb-2 text-2xl">Disclaimer</h1>
            <p>BrewDocs is currently in an early prototyping phase, and thus is not considered stable. It is mostly deployed for demo purposes.</p>
            <div className="divider divider-secondary"></div>
            <p>If you run into issues with, you can add <code className="bg-gray-200 whitespace-nowrap">?purge=true</code> to the URL to clear your db and cache.</p>
        </div>
    );
}
