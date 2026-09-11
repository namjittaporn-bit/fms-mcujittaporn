import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalHero, type PortalHeroProps } from "./portal-hero";

function baseProps(overrides: Partial<PortalHeroProps> = {}): PortalHeroProps {
  return {
    locale: "th",
    mascotSrc: "/images/hero-mascot.jpg",
    ...overrides,
  };
}

describe("PortalHero", () => {
  it("renders headline and descriptions in Thai and English", () => {
    const { rerender } = render(<PortalHero {...baseProps({ locale: "th" })} />);
    expect(screen.getByText(/เชื่อมต่อการศึกษา วิจัย/)).toBeTruthy();
    expect(screen.getByText("อ่านข่าวประชาสัมพันธ์")).toBeTruthy();

    rerender(<PortalHero {...baseProps({ locale: "en" })} />);
    expect(screen.getByText(/Connecting Education,/)).toBeTruthy();
    expect(screen.getByText("Explore News")).toBeTruthy();
  });

  it("renders mascot image with correct src and alt text", () => {
    render(<PortalHero {...baseProps()} />);
    const img = screen.getByAltText("มาสคอตคณะเทคโนโลยีและการจัดการ");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("/images/hero-mascot.jpg");
  });

  it("triggers playful speech bubble counter when clicking on the mascot", () => {
    render(<PortalHero {...baseProps({ locale: "th" })} />);
    expect(screen.getByText("ยินดีต้อนรับสู่ คณะเทคโนโลยีและการจัดการ! ✨")).toBeTruthy();

    const mascotButton = screen.getByRole("button", { name: "คลิกที่มาสคอตเพื่อทักทาย" });
    fireEvent.click(mascotButton);
    expect(screen.getByText("เหมียว! ครั้งที่ 1 🐾")).toBeTruthy();

    fireEvent.click(mascotButton);
    expect(screen.getByText("เหมียว! ครั้งที่ 2 🐾")).toBeTruthy();
  });

  it("renders navigation links to news and login", () => {
    render(<PortalHero {...baseProps({ locale: "en" })} />);
    const newsLink = screen.getByRole("link", { name: /Explore News/ });
    expect(newsLink.getAttribute("href")).toBe("/news");

    const portalLink = screen.getByRole("link", { name: /Internal Portal/ });
    expect(portalLink.getAttribute("href")).toBe("/login");
  });
});
