export default function Home() {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] hero bg-base-200">
        <div className="hero-content flex-col text-center">
            <h1 className="text-5xl font-bold">Welcome to BrewDocs!</h1>
            <p className="py-6">
                BrewDocs is a digital homebrewer handbook, toolkit, and brew day application.
            </p>
            <button className="btn btn-ghost btn-sm">Read more...</button>
        </div>
    </div>
  );
}
