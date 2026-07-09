import {Link, useRouter} from "@tanstack/react-router";

export type NavListProps = {
    nav: [string, string?][];
}

export default function Navlist({ nav }: NavListProps) {
    const router = useRouter();
    return (
        <ul className="menu text-primary-content text-lg mt-6">
            {nav.map(([name, link]) => (
                link
                    ? <li key={name}>{
                        link in router.routesByPath
                            // nav links are runtime strings, so this Link is untyped
                            ? <Link to={link as any}>{name}</Link>
                            : <a href={link}>{name}</a>
                    }</li>
                    : <li key={name} className="pl-4 text-secondary-content">{name}</li>
            ))}
        </ul>
    );
}
