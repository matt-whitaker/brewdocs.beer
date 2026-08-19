import {Link, useRouter} from "@tanstack/react-router";

export type NavListProps = {
    nav: [string, string?][];
};

export default function Navlist({ nav }: NavListProps) {
    const router = useRouter();
    return (
        <ul className="menu text-primary-content text-lg mt-6 w-full">
            {nav.map(([name, link]) => {
                if (link && link !== "divider") {
                    return (
                        <li key={name}>{
                            link in router.routesByPath

                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ? <Link to={link as any}>{name}</Link>
                                : <a href={link}>{name}</a>
                        }</li>
                    );
                }

                if (link === "divider") {
                    return <div key={name} className="divider w-full divider-secondary">{name}</div>;
                }

                return <li key={name} className="pl-4 text-secondary-content">{name}</li>;
            })}
        </ul>
    );
}
