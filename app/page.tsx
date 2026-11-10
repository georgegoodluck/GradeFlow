import { GoldOrb } from "@/components/gold-orb";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-charcoal">
      <h1 className="font-playfair text-6xl text-gold">School Grading SaaS</h1>
      <div className="h-[400px] w-[400px]">
        <GoldOrb />
      </div>
    </main>
  );
}
