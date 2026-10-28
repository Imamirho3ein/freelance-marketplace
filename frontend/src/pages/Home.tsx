import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Briefcase, Users, Shield, Zap } from "lucide-react";

const features = [
  { icon: Briefcase, title: "Post Projects", desc: "Describe your project and receive competitive bids from skilled freelancers." },
  { icon: Users, title: "Hire Talent", desc: "Browse profiles, portfolios and reviews to find the perfect match." },
  { icon: Shield, title: "Secure Payments", desc: "Escrow-protected milestone payments release only when you approve." },
  { icon: Zap, title: "Real-time Chat", desc: "Communicate instantly with built-in messaging and file sharing." },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-4xl font-extrabold md:text-6xl">Find the perfect freelancer for your project</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            GigForge connects businesses with top freelance talent. Post a job, get bids, and pay securely.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/projects/new"><Button size="lg" variant="secondary">Post a Job</Button></Link>
            <Link to="/projects"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Find Work</Button></Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <f.icon className="mb-3 text-brand-600" size={28} />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-slate-900 py-12 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-slate-400">Join thousands of freelancers and clients.</p>
        <Link to="/register" className="mt-4 inline-block"><Button size="lg">Create Account</Button></Link>
      </section>
    </div>
  );
}
