import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>404</h1>
      <p>This page could not be found.</p>
      <Link
        href="/"
        style={{
          color: "#60a5fa",
          textDecoration: "underline",
        }}
      >
        Go back home
      </Link>
    </div>
  );
}