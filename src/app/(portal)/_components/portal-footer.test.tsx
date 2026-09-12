import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalFooter, type PortalFooterProps } from "./portal-footer";

function baseProps(overrides: Partial<PortalFooterProps> = {}): PortalFooterProps {
  return {
    brandName: "Faculty of Technology",
    brandTagline: "Excellence in Innovation & Education",
    brandLogo: null,
    locale: "th",
    ...overrides,
  };
}

describe("PortalFooter", () => {
  it("renders brand information and default graduation icon", () => {
    render(<PortalFooter {...baseProps()} />);
    expect(screen.getAllByText("Faculty of Technology").length).toBeGreaterThan(0);
    expect(screen.getByText("Excellence in Innovation & Education")).toBeTruthy();
  });

  it("renders custom brandLogo when supplied", () => {
    const { container } = render(
      <PortalFooter {...baseProps({ brandLogo: "/uploads/logos/fms-logo.png" })} />
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("/uploads/logos/fms-logo.png");
  });

  it("renders Thai and English content appropriately based on locale", () => {
    const { rerender } = render(<PortalFooter {...baseProps({ locale: "th" })} />);
    expect(screen.getByText("บริการวิชาการและข้อมูล")).toBeTruthy();
    expect(screen.getByText("ติดต่อสอบถาม")).toBeTruthy();
    expect(screen.getByText("ระบบบริการภายใน")).toBeTruthy();

    rerender(<PortalFooter {...baseProps({ locale: "en" })} />);
    expect(screen.getByText("Academic & Services")).toBeTruthy();
    expect(screen.getByText("Contact Us")).toBeTruthy();
    expect(screen.getByText("Internal Systems")).toBeTruthy();
  });

  it("renders essential public and internal links", () => {
    render(<PortalFooter {...baseProps({ locale: "en" })} />);
    expect(screen.getByRole("link", { name: /News & Events/ })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Curriculum/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Faculty & Staff/ })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Admin Console/ }).length).toBeGreaterThan(0);
  });

  it("renders custom contact details and external links when provided", () => {
    render(
      <PortalFooter
        {...baseProps({
          locale: "th",
          contact: {
            addressTh: "79 ม.3 วังน้อย อยุธยา",
            addressEn: "79 Moo 3 Wang Noi",
            phone: "035-248-000",
            email: "contact@mcu.ac.th",
            workingHoursTh: "จันทร์ - ศุกร์: 08:30 - 16:30 น.",
            workingHoursEn: "Mon - Fri: 8:30 - 16:30",
            facebookUrl: "https://facebook.com/mcu",
            lineId: "@mcuofficial",
            websiteUrl: "https://www.mcu.ac.th",
            googleMapUrl: "https://maps.google.com/?cid=123",
          },
        })}
      />
    );
    expect(screen.getByText("79 ม.3 วังน้อย อยุธยา")).toBeTruthy();
    expect(screen.getByRole("link", { name: "035-248-000" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "contact@mcu.ac.th" })).toBeTruthy();
    expect(screen.getByText("Line: @mcuofficial")).toBeTruthy();
    expect(screen.getByRole("link", { name: /เว็บไซต์/ })).toBeTruthy();
  });
});
