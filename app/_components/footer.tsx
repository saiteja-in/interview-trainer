import { Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background px-8 py-6 md:py-8">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="text-xl font-bold text-primary">
            App
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2024 App all rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-6 md:space-y-0">
          <nav className="flex flex-wrap justify-center gap-4">
            <Link
              href="#privacy-policy"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="#terms-and-conditions"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Terms & Conditions
            </Link>
            <Link
              href="#shipping-and-delivery"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Shipping & Delivery
            </Link>
            <Link
              href="#contact-us"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Contact Us
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}