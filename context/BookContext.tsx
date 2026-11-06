"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type BookStatus = "To Read" | "Reading" | "Finished";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  created_at: string;
}

interface BookContextType {
  user: User | null;
  authLoading: boolean;
  books: Book[];
  booksLoading: boolean;
  fetchBooks: () => Promise<void>;
  addBook: (book: { title: string; author: string; pages: number; status: BookStatus }) => Promise<{ data?: Book; error?: any }>;
  advanceStatus: (id: string, currentStatus: BookStatus) => Promise<{ error?: any }>;
  deleteBook: (id: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
}

const BookContext = createContext<BookContextType | null>(null);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data as Book[]);
    }
    setBooksLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchBooks();
      } else {
        setUser(null);
        setBooks([]);
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchBooks();
      } else {
        setUser(null);
        setBooks([]);
      }
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchBooks]);

  const addBook = async (book: { title: string; author: string; pages: number; status: BookStatus }) => {
    if (!user) return { error: { message: "Not logged in" } };

    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          user_id: user.id,
          title: book.title.trim(),
          author: book.author.trim(),
          pages: book.pages,
          status: book.status,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error };
    }

    if (data) {
      setBooks((prev) => [data as Book, ...prev]);
      return { data: data as Book };
    }

    return {};
  };

  const advanceStatus = async (id: string, currentStatus: BookStatus) => {
    let nextStatus: BookStatus | null = null;
    if (currentStatus === "To Read") nextStatus = "Reading";
    else if (currentStatus === "Reading") nextStatus = "Finished";

    if (!nextStatus) return { error: { message: "Already finished" } };

    const { error } = await supabase
      .from("books")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      return { error };
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus as BookStatus } : b))
    );
    return {};
  };

  const deleteBook = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      return { error };
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBooks([]);
  };

  return (
    <BookContext.Provider
      value={{
        user,
        authLoading,
        books,
        booksLoading,
        fetchBooks,
        addBook,
        advanceStatus,
        deleteBook,
        logout,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}

