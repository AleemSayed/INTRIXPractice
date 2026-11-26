
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="public-home">
      <nav className="public-nav">
        <Link href="/" className="brand">INTRIX</Link>
        <div className="public-nav-links">
          <Link href="/login">Login</Link>
          <Link href="/signup" className="signup-link">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">WELCOME TO INTRIX</p>
        <h1>One workspace.<br />Everything connected.</h1>
        <p className="hero-description">
          A smarter way to manage registered users, communicate with our team,
          and access information through AI.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="primary-button">
            Get Started →
          </Link>
          <Link href="/login" className="secondary-button">
            Sign In
          </Link>
        </div>
      </section>

      <footer className="public-footer">
        © {new Date().getFullYear()} © 2026 INTRIX. All rights reserved.
      </footer>
    </main>
  );
}
