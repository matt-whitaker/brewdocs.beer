import Link from "next/link";

export type NavListProps = {
    nav: [string, string][];
}

export default function Navlist({ nav }: NavListProps) {
    return (
        <ul className="menu text-primary-content text-lg">
            {nav.map(([name, link]) => (
                link
                    ? <li key={name}><Link href={link}>{name}</Link></li>
                    : <li key={name} className="pl-4 text-secondary-content">{name}</li>
            ))}
        </ul>
    );
}