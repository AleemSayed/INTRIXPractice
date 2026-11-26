
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Welcome to INTRIX</h1>
          <p className="muted">
            Your workspace is ready. Choose where you want to go.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <Link href="/users" className="dashboard-card">
          <span className="card-icon">01</span>
          <h2>Registered Users</h2>
          <p>View the registered users directory.</p>
          <span className="card-link">Explore users →</span>
        </Link>

        <Link href="/contact" className="dashboard-card">
          <span className="card-icon">02</span>
          <h2>Contact Us</h2>
          <p>Send a message to the INTRIX team.</p>
          <span className="card-link">Open contact form →</span>
        </Link>

        <Link href="/chat" className="dashboard-card">
          <span className="card-icon">03</span>
          <h2>AI Chatbot</h2>
          <p>Ask questions about registered users.</p>
          <span className="card-link">Start chatting →</span>
        </Link>
      </div>
    </div>
  );
}
