import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

describe("UI Components Unit Tests", () => {
  describe("Button Component", () => {
    it("should render button with text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("should handle click events", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByText("Click me"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled button</Button>);
      expect(screen.getByText("Disabled button")).toBeDisabled();
    });

    it("should apply variant styles correctly", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByText("Delete");
      expect(button).toHaveClass("bg-destructive");
    });

    it("should apply size styles correctly", () => {
      render(<Button size="lg">Large button</Button>);
      const button = screen.getByText("Large button");
      expect(button).toHaveClass("h-11");
    });
  });

  describe("Input Component", () => {
    it("should render input with placeholder", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("should handle input changes", async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Enter text" />);

      const input = screen.getByPlaceholderText("Enter text");
      await user.type(input, "Hello World");

      expect(input).toHaveValue("Hello World");
    });

    it("should be disabled when disabled prop is true", () => {
      render(<Input disabled placeholder="Disabled input" />);
      expect(screen.getByPlaceholderText("Disabled input")).toBeDisabled();
    });

    it("should show error state", () => {
      render(<Input className="border-red-500" placeholder="Error input" />);
      const input = screen.getByPlaceholderText("Error input");
      expect(input).toHaveClass("border-red-500");
    });
  });

  describe("Card Component", () => {
    it("should render card with content", () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const {container} = render(
        <Card className="custom-class">
          <div>Card content</div>
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Badge Component", () => {
    it("should render badge with text", () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("should apply variant styles", () => {
      render(<Badge variant="destructive">Error</Badge>);
      const badge = screen.getByText("Error");
      expect(badge).toHaveClass("bg-destructive");
    });

    it("should apply custom className", () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("custom-badge");
    });
  });
});
