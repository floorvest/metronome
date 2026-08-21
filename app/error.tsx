"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Something went wrong
      </h1>
      <button
        onClick={reset}
        style={{
          padding: "0.5rem 1rem",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}