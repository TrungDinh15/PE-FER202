import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BookPlus, ListChecks, Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1
          data-testid="home-title"
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
        >
          ShelfLife
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8">
          A small web app where each person keeps a list of the books they want to read,
          are reading or have finished, and sees how much they have on their shelf.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/books">
            <Button size="lg" className="px-8">
              Open My Shelf
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <BookPlus className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Add books</CardTitle>
            <CardDescription>
              Record title, author, total pages and initial reading status for every book you want to track.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 text-muted-foreground text-sm">
            Keep your reading wishlist organized and never lose track of recommendations.
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <ListChecks className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Track your progress</CardTitle>
            <CardDescription>
              Advance status with a single click: from To Read to Reading and finally to Finished.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 text-muted-foreground text-sm">
            Celebrate milestones as you read and watch your finished reading list grow.
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Search className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Search your shelf</CardTitle>
            <CardDescription>
              Instantly filter by status, search by title or author, and view real-time summary statistics.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 text-muted-foreground text-sm">
            See total pages read, active books, and a detailed breakdown by status.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
