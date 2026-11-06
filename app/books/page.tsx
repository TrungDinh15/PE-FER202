"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooks, BookStatus } from "@/context/BookContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ArrowRight } from "lucide-react";

const STATUSES: BookStatus[] = ["To Read", "Reading", "Finished"];

interface FormErrors {
  title?: string;
  author?: string;
  pages?: string;
  status?: string;
  book?: string;
}

export default function BooksPage() {
  const router = useRouter();
  const {
    user,
    authLoading,
    books,
    addBook,
    advanceStatus,
    deleteBook,
  } = useBooks();

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookSuccess, setBookSuccess] = useState("");

  // Filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Show nothing while checking auth (no flash)
  if (authLoading || !user) {
    return null;
  }

  function validateForm(t: string, a: string, p: string, s: string): FormErrors {
    const errs: FormErrors = {};
    if (!t.trim()) errs.title = "Title is required";
    else if (t.trim().length > 80) errs.title = "Title must be at most 80 characters";
    if (!a.trim()) errs.author = "Author is required";
    else if (a.trim().length > 60) errs.author = "Author must be at most 60 characters";
    const pNum = Number(p);
    if (!p.trim()) errs.pages = "Pages is required";
    else if (!Number.isInteger(pNum) || pNum < 1 || pNum > 5000)
      errs.pages = "Pages must be a whole number from 1 to 5000";
    if (!s) errs.status = "Please choose a status";
    return errs;
  }

  const handleFormChange = (field: string, value: string) => {
    if (field === "title") setTitle(value);
    else if (field === "author") setAuthor(value);
    else if (field === "pages") setPages(value);
    else if (field === "status") setStatus(value);

    if (formSubmitted) {
      const t = field === "title" ? value : title;
      const a = field === "author" ? value : author;
      const p = field === "pages" ? value : pages;
      const s = field === "status" ? value : status;
      const errs = validateForm(t, a, p, s);
      setFormErrors((prev) => ({ ...prev, [field]: errs[field as keyof FormErrors], book: undefined }));
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setBookSuccess("");
    setFormErrors((prev) => ({ ...prev, book: undefined }));

    const errs = validateForm(title, author, pages, status);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const result = await addBook({
      title: title.trim(),
      author: author.trim(),
      pages: Number(pages),
      status: status as BookStatus,
    });

    if (result.error) {
      setFormErrors({ book: result.error.message || "Failed to add book" });
      return;
    }

    setBookSuccess("Book added successfully");
    setTitle("");
    setAuthor("");
    setPages("");
    setStatus("");
    setFormSubmitted(false);
    setFormErrors({});
  };

  const handleAdvance = async (id: string, currentStatus: BookStatus) => {
    await advanceStatus(id, currentStatus);
  };

  const handleDelete = async (id: string) => {
    await deleteBook(id);
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = books;
    if (filterStatus) {
      result = result.filter((b) => b.status === filterStatus);
    }
    if (searchInput.trim()) {
      const q = searchInput.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, filterStatus, searchInput]);

  // Summary stats (based on filtered books)
  const bookCount = filteredBooks.length;
  const totalPages = filteredBooks.reduce((sum, b) => sum + b.pages, 0);
  const breakdown = STATUSES.map((s) => ({
    name: s,
    count: filteredBooks.filter((b) => b.status === s).length,
  }));

  const handleClearFilters = () => {
    setFilterStatus("");
    setSearchInput("");
  };

  return (
    <div data-testid="books-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* Left column: Form + Summary */}
        <div className="space-y-6">
          {/* Add Book Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add a book</CardTitle>
            </CardHeader>
            <CardContent>
              <form data-testid="book-form" onSubmit={handleAddBook} noValidate className="space-y-4">
                {bookSuccess && (
                  <p data-testid="book-success" className="text-sm text-green-600 font-medium">
                    {bookSuccess}
                  </p>
                )}
                {formErrors.book && (
                  <p data-testid="error-book" className="text-sm text-destructive">
                    {formErrors.book}
                  </p>
                )}

                <div className="space-y-1">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    placeholder="Book title"
                    value={title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                  />
                  {formErrors.title && (
                    <p data-testid="error-title" className="text-sm text-destructive">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="author" className="text-sm font-medium">Author</label>
                  <Input
                    id="author"
                    data-testid="input-author"
                    placeholder="Author name"
                    value={author}
                    onChange={(e) => handleFormChange("author", e.target.value)}
                  />
                  {formErrors.author && (
                    <p data-testid="error-author" className="text-sm text-destructive">{formErrors.author}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="pages" className="text-sm font-medium">Pages</label>
                  <Input
                    id="pages"
                    type="number"
                    data-testid="input-pages"
                    placeholder="Number of pages"
                    value={pages}
                    onChange={(e) => handleFormChange("pages", e.target.value)}
                  />
                  {formErrors.pages && (
                    <p data-testid="error-pages" className="text-sm text-destructive">{formErrors.pages}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <select
                    id="status"
                    data-testid="select-status"
                    value={status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Choose status</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {formErrors.status && (
                    <p data-testid="error-status" className="text-sm text-destructive">{formErrors.status}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" data-testid="btn-add-book">
                  Add Book
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Books</span>
                <span data-testid="book-count" className="font-medium">{bookCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total pages</span>
                <span data-testid="total-pages" className="font-medium">{totalPages}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">By status</p>
                <div data-testid="status-breakdown" className="space-y-1">
                  {breakdown.map((row) => (
                    <div key={row.name} data-testid="breakdown-row" className="flex justify-between text-sm">
                      <span data-testid="breakdown-name">{row.name}</span>
                      <span data-testid="breakdown-count" className="font-medium">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Filters + Book list */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              data-testid="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-8 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Input
              data-testid="search-input"
              placeholder="Search by title or author…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="sm:flex-1"
            />
            <Button
              variant="outline"
              data-testid="btn-clear-filters"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>

          {/* Book list */}
          <div data-testid="book-list" className="space-y-3">
            {filteredBooks.length === 0 ? (
              <p data-testid="books-empty" className="text-center text-muted-foreground py-12">
                No books yet. Add one above!
              </p>
            ) : (
              filteredBooks.map((book) => (
                <Card key={book.id} data-testid="book-item" className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 data-testid="book-title" className="font-semibold truncate">{book.title}</h3>
                      <p data-testid="book-author" className="text-sm text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span data-testid="book-pages" className="text-xs text-muted-foreground">
                          {book.pages} pages
                        </span>
                        <span
                          data-testid="book-status"
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            book.status === "Finished"
                              ? "bg-green-100 text-green-700"
                              : book.status === "Reading"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {book.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {book.status !== "Finished" && (
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="btn-advance-status"
                          onClick={() => handleAdvance(book.id, book.status)}
                          title={book.status === "To Read" ? "Start reading" : "Mark finished"}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        data-testid="btn-delete-book"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

