import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalHero, type PortalHeroProps } from "./portal-hero";

function baseProps(overrides: Partial<PortalHeroProps> = {}): PortalHeroProps {
  return {
    locale: "th",
    ...overrides,
  };
}

describe("PortalHero", () => {
  it("renders editorial headline and narrative descriptions in Thai and English", () => {
    const { rerender } = render(<PortalHero {...baseProps({ locale: "th" })} />);
    expect(screen.getByText(/สร้างสรรค์คลื่นลูกใหม่/)).toBeTruthy();
    expect(screen.getByText(/ด้วยวิสัยทัศน์ที่ก้าวล้ำ/)).toBeTruthy();
    expect(screen.getByText("อ่านข่าวประชาสัมพันธ์")).toBeTruthy();
    expect(screen.getByText("ดูหลักสูตรการศึกษา")).toBeTruthy();

    rerender(<PortalHero {...baseProps({ locale: "en" })} />);
    expect(screen.getByText(/Build the next wave/)).toBeTruthy();
    expect(screen.getByText(/the bold way\./)).toBeTruthy();
    expect(screen.getAllByText("Start a chat").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("View projects")).toBeTruthy();
  });

  it("renders navigation links to news and curriculum", () => {
    render(<PortalHero {...baseProps({ locale: "en" })} />);
    const chatLink = screen.getByRole("link", { name: /Start a chat/ });
    expect(chatLink.getAttribute("href")).toBe("/news");

    const projectsLink = screen.getByRole("link", { name: /View projects/ });
    expect(projectsLink.getAttribute("href")).toBe("/curriculum");
  });

  it("renders the 3 showcase cards (Our Sky, Vortex Core, Where ideas ignite)", () => {
    render(<PortalHero {...baseProps({ locale: "en" })} />);
    expect(screen.getByText("Our Sky")).toBeTruthy();
    expect(screen.getByText("Vortex Interactive Core")).toBeTruthy();
    expect(screen.getByText("Where ideas ignite")).toBeTruthy();
  });

  it("switches active showcase card when clicking cards and indicator dots", () => {
    render(<PortalHero {...baseProps({ locale: "en" })} />);
    
    // Test selecting card 1 (Our Sky)
    const skyCard = screen.getByText("Our Sky").closest(".group");
    expect(skyCard).toBeTruthy();
    if (skyCard) {
      fireEvent.click(skyCard);
    }

    // Test clicking indicator buttons
    const dotBtn3 = screen.getByRole("button", { name: "Select showcase card 3" });
    fireEvent.click(dotBtn3);
  });

  it("handles mouse move and leave events for 3D tilt without error", () => {
    const { container } = render(<PortalHero {...baseProps({ locale: "en" })} />);
    const perspectiveBox = container.querySelector(".perspective-\\[1200px\\]");
    expect(perspectiveBox).toBeTruthy();

    if (perspectiveBox) {
      fireEvent.mouseMove(perspectiveBox, { clientX: 200, clientY: 150 });
      fireEvent.mouseLeave(perspectiveBox);
    }
  });
});
