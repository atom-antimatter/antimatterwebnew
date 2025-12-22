export default function AtomCallout() {
  return (
    <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30">
      <h3 className="text-lg font-semibold text-secondary mb-2">
        Why Atom is Different
      </h3>
      <p className="text-foreground/90 leading-relaxed">
        Most vendors are <strong>SaaS products you rent</strong>. Atom is a{" "}
        <strong>deployment you own</strong>. You control the infrastructure, own the IP, and get
        predictable managed service pricing without vendor lock-in.
      </p>
    </div>
  );
}

