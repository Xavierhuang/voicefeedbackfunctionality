"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // This effect will only run on the client, after the initial render.
    // This ensures the year is consistent and avoids a hydration mismatch.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground md:px-6">
        <p>&copy; {year} YAP Language Learning. All rights reserved.</p>
        <p className="mt-1">Built with ❤️ for genuine language understanding.</p>
      </div>
    </footer>
  );
}