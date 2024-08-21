import Hero from "@/component/hero";

export default function Home() {
  return (
      <Hero title="Welcome to BrewDocs!">
          <p className="py-6">
              BrewDocs is a digital homebrewer handbook, toolkit, and brew day application.
          </p>
          <a href="/about" className="btn btn-ghost btn-sm">Read more...</a>
      </Hero>
  );
}
