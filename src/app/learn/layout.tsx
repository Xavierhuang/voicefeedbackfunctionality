
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-4xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
