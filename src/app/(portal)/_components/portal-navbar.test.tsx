import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalNavbar, type PortalNavbarProps } from "./portal-navbar";

const setThemeMock = vi.fn();
let themeValue = "light";
let mockPathname = "/";
let mockSearchParams = new URLSearchParams();

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: themeValue, setTheme: setThemeMock }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/layout/language-switcher", () => ({
  LanguageSwitcher: () => <button data-testid="lang-switcher">EN</button>,
}));

function baseProps(overrides: Partial<PortalNavbarProps> = {}): PortalNavbarProps {
  return {
    brandName: "Faculty of Technology",
    brandTagline: "Excellence in Innovation & Education",
    brandLogo: null,
    locale: "th",
    ...overrides,
  };
}

describe("PortalNavbar", () => {
  beforeEach(() => {
    setThemeMock.mockClear();
    themeValue = "light";
    mockPathname = "/";
    mockSearchParams = new URLSearchParams();
  });

  it("renders brand block with name, tagline and fallback icon", () => {
    render(<PortalNavbar {...baseProps()} />);
    expect(screen.getByText("Faculty of Technology")).toBeTruthy();
    expect(screen.getByText("Excellence in Innovation & Education")).toBeTruthy();
  });

  it("renders custom brandLogo when provided", () => {
    const { container } = render(
      <PortalNavbar {...baseProps({ brandLogo: "/uploads/logos/faculty-logo.png" })} />
    );
    const img = container.querySelector(".brand-blk i img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("/uploads/logos/faculty-logo.png");
  });

  it("renders all portal menu items in Thai and English", () => {
    const { rerender } = render(<PortalNavbar {...baseProps({ locale: "th" })} />);
    expect(screen.getByText("หน้าหลัก")).toBeTruthy();
    expect(screen.getByText("ข่าวสารและกิจกรรม")).toBeTruthy();
    expect(screen.getByText("หลักสูตรการศึกษา")).toBeTruthy();
    expect(screen.getByText("ทำเนียบบุคลากร")).toBeTruthy();
    expect(screen.getByText("ทุนการศึกษา")).toBeTruthy();
    expect(screen.getByText("จัดซื้อจัดจ้าง")).toBeTruthy();

    rerender(<PortalNavbar {...baseProps({ locale: "en" })} />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("News & Events")).toBeTruthy();
    expect(screen.getByText("Curriculum")).toBeTruthy();
    expect(screen.getByText("Faculty & Staff")).toBeTruthy();
    expect(screen.getByText("Scholarships")).toBeTruthy();
    expect(screen.getByText("Procurement")).toBeTruthy();
  });

  it("highlights the active link according to current pathname and query params", () => {
    mockPathname = "/curriculum";
    const { rerender } = render(<PortalNavbar {...baseProps({ locale: "en" })} />);
    const curriculumLink = screen.getByRole("link", { name: "Curriculum" });
    expect(curriculumLink.getAttribute("aria-current")).toBe("page");

    mockPathname = "/news";
    mockSearchParams = new URLSearchParams("category=SCHOLARSHIP");
    rerender(<PortalNavbar {...baseProps({ locale: "en" })} />);
    const scholarshipLink = screen.getByRole("link", { name: "Scholarships" });
    expect(scholarshipLink.getAttribute("aria-current")).toBe("page");
  });

  it("toggles theme when clicking theme button", () => {
    render(<PortalNavbar {...baseProps({ locale: "en" })} />);
    const themeBtn = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(themeBtn);
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("toggles mobile menu drawer on hamburger click", () => {
    render(<PortalNavbar {...baseProps({ locale: "th" })} />);
    const toggleBtn = screen.getByRole("button", { name: "เปิด/ปิดเมนู" });
    expect(toggleBtn.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggleBtn);
    expect(toggleBtn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("เข้าสู่ระบบบุคลากร")).toBeTruthy();
  });
});
