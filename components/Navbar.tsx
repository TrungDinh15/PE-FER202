"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBooks } from "@/context/BookContext";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Navbar() {
  const { user, logout, authLoading } = useBooks();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
            <BookOpen className="w-6 h-6" />
            ShelfLife
          </Link>
          {user && (
            <Link
              href="/books"
              data-testid="link-books"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Books
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!authLoading && (
            <>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span
                    data-testid="user-email"
                    className="text-sm text-muted-foreground"
                  >
                    {user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" data-testid="btn-login">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" data-testid="btn-register">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
