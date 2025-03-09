// src/components/common/Button/Button.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Test Button</Button>);
    expect(
      screen.getByRole("button", { name: /test button/i })
    ).toBeInTheDocument();
  });

  it("applies the correct variant classes", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary-600");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary-600");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-neutral-300");

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-error-500");

    rerender(<Button variant="success">Success</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-success-500");
  });

  it("applies the correct size classes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3 py-1.5 text-sm");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-4 py-2 text-sm");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-5 py-2.5 text-base");
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  it("renders with an icon", () => {
    const icon = <span data-testid="test-icon">icon</span>;
    render(<Button icon={icon}>With Icon</Button>);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies fullWidth class when fullWidth is true", () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when loading", async () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} isLoading>
        Loading
      </Button>
    );

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
