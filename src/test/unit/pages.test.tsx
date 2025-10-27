import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

// Mock react-helmet-async
vi.mock("react-helmet-async", () => ({
  Helmet: ({children}: {children: React.ReactNode}) => children,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Page Components Unit Tests", () => {
  describe("Home Page", () => {
    it("should render home page content", () => {
      renderWithRouter(<Home />);

      // Check for main heading
      expect(screen.getByText("Welcome to AuriCare")).toBeInTheDocument();
    });

    it("should display main heading", () => {
      renderWithRouter(<Home />);

      // Look for common home page elements
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe("About Page", () => {
    it("should render about page content", () => {
      renderWithRouter(<About />);

      // Check for main heading
      expect(screen.getByText("Our Mission")).toBeInTheDocument();
    });
  });

  describe("NotFound Page", () => {
    it("should render 404 page content", () => {
      renderWithRouter(<NotFound />);

      // Check for 404 heading
      expect(screen.getByText("404")).toBeInTheDocument();
    });

    it("should display error message", () => {
      renderWithRouter(<NotFound />);

      // Look for 404 or not found text
      const errorText = screen.getByText("Oops! Page not found");
      expect(errorText).toBeInTheDocument();
    });
  });
});
