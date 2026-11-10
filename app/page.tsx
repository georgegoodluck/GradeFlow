import { GoldOrb } from "@/components/gold-orb";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-charcoal overflow-hidden">
      <div className="z-10 text-center space-y-4">
        <h1 className="font-playfair text-6xl md:text-8xl text-white">
          School <span className="text-gold">Grading</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-lg mx-auto">
          The premium multi-tenant grading platform for modern institutions.
        </p>
        <div className="pt-8 flex gap-4 justify-center">
          <a
            href="/register"
            className="rounded-lg bg-gold px-8 py-3 text-charcoal font-medium hover:bg-[#d4b573] transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-lg border border-white/20 px-8 py-3 text-white hover:bg-white/5 transition"
          >
            Sign In
          </a>
        </div>
      </div>

      {/* Background 3D element */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] translate-x-1/3">
          <GoldOrb />
        </div>
      </div>
    </main>
  );
}
