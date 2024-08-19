import Hero from "@/component/hero";

export default function Home() {
  return (
      <Hero title="Welcome to BrewDocs!">
          <p className="py-6">
              BrewDocs is a digital homebrewer handbook, toolkit, and brew day application.
          </p>
          <button className="btn btn-ghost btn-sm">Read more...</button>
      </Hero>
  );
}
