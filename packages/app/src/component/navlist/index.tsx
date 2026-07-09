import {Link} from "@tanstack/react-router";

export type NavListProps = {
    nav: [string, string?][];
}

export default function Navlist({ nav }: NavListProps) {
    return (
        <ul className="menu text-primary-content text-lg mt-6">
            {nav.map(([name, link]) => (
                link
                    ? <li key={name}>{
                        link.startsWith("http")
                            ? <a href={link}>{name}</a>
                            // nav links are runtime strings, so this Link is untyped
                            : <Link to={link as any}>{name}</Link>
                    }</li>
                    : <li key={name} className="pl-4 text-secondary-content">{name}</li>
            ))}
        </ul>
    );
}
