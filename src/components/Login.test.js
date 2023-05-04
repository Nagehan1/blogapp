import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import Login from "./Login";

describe("Login component", () => {
  test("renders email and password fields", () => {
    render(<Login />);
    const emailField = screen.getByLabelText("Email address");
    const passwordField = screen.getByLabelText("Password");
    expect(emailField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
  });

  test("updates email state when email field changes", () => {
    render(<Login />);
    const emailField = screen.getByLabelText("Email address");
    fireEvent.change(emailField, { target: { value: "test@example.com" } });
    expect(emailField.value).toBe("test@example.com");
  });

  test("updates password state when password field changes", () => {
    render(<Login />);
    const passwordField = screen.getByLabelText("Password");
    fireEvent.change(passwordField, { target: { value: "password123" } });
    expect(passwordField.value).toBe("password123");
  });

  test("submits user data to server when login button is clicked", async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          message: "User logged in",
          data: { token: "123", is_admin: true },
        }),
    });
    render(<Login />);
    const emailField = screen.getByLabelText("Email address");
    const passwordField = screen.getByLabelText("Password");
    fireEvent.change(emailField, { target: { value: "test@example.com" } });
    fireEvent.change(passwordField, { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });
  });

  test("displays alert message when login fails due to invalid credentials", async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          message: "Login failed",
          errors: [{ msg: "Invalid credentials" }],
        }),
    });
    render(<Login />);
    fireEvent.click(screen.getByText("Login"));
    const alert = await screen.findByText("Invalid credentials");
    expect(alert).toBeInTheDocument();
  });

  test("displays alert message when login fails due to missing data", async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          message: "Login failed",
          errors: [{ msg: "Missing data" }],
        }),
    });
    render(<Login />);
    fireEvent.click(screen.getByText("Login"));
    const alert = await screen.findByText("Fill in all fields");
    expect(alert).toBeInTheDocument();
  });

  test("navigates to registration page when register button is clicked", () => {
    const mockLocation = { href: "" };
    delete window.location;
    window.location = mockLocation;
    render(<Login />);
    fireEvent.click(screen.getByText("Register"));
    expect(mockLocation.href).toBe("/register");
  });
});
