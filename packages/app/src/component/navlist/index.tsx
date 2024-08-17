import Link from "next/link";

export type NavListProps = {
    nav: [string, string][];
}

export default function Navlist({ nav }: NavListProps) {
    return (
        <ul className="menu text-base-content">
            {nav.map(([name, link]) => (
                link ? <li><Link href={link}>{name}</Link></li> : <li className="pl-4">{name}</li>
            ))}
        </ul>
    );
}