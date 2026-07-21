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
            <p>If you run into issues with it, you can use the button below to perform a wipe and start fresh.</p>
            <p><a className="btn btn-primary btn-sm mt-1" href="/?purge=true">Purge Data</a></p>
            <p>If your locally cached data is out of date, you can use the button below to run pending migrations.</p>
            <p><a className="btn btn-secondary btn-sm mt-1" href="/?migrate=true">Migrate Data</a></p>
        </div>
    );
}
