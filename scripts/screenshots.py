"""
Screenshot automation for Storify.

Usage:
    python scripts/screenshots.py                    # uses defaults
    python scripts/screenshots.py --base-url http://localhost:5173
    python scripts/screenshots.py --routes / /about /journal
    python scripts/screenshots.py --viewports desktop mobile

Install:
    pip install playwright
    playwright install chromium
"""

import argparse
import asyncio
from datetime import datetime
from pathlib import Path

from playwright.async_api import async_playwright, Page

# --- Defaults you can edit ----------------------------------------------------

DEFAULT_BASE_URL = "https://mystorify.se"

DEFAULT_ROUTES = [
    "/",
    "/about",
    "/journal",
    "/badges",
    "/blog",
    "/community",
    "/contact",
    "/cookies",
    "/editor",
    "/guide",
    "/interview",
    "/privacy",
    "/quick",
    "/speak",
    "/terms",
    "/voices",
    "/wizard"
]

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900, "device_scale_factor": 2},
    "tablet":  {"width": 834,  "height": 1194, "device_scale_factor": 2},
    "mobile":  {"width": 390,  "height": 844,  "device_scale_factor": 3},
}

OUTPUT_DIR = Path("screenshots")

# --- Helpers ------------------------------------------------------------------

def slugify_route(route: str) -> str:
    """Turn '/journal/new' into 'journal-new', '/' into 'home'."""
    cleaned = route.strip("/").replace("/", "-")
    return cleaned or "home"


async def wait_for_fonts_and_animations(page: Page) -> None:
    """Wait for fonts, network idle, and let CSS animations settle."""
    await page.wait_for_load_state("networkidle")
    await page.evaluate("document.fonts.ready")
    # Small extra pause for any JS-driven entrance animations
    await page.wait_for_timeout(500)


async def auto_scroll(page: Page) -> None:
    """
    Trigger lazy-loaded content by scrolling to the bottom and back.
    Useful before full_page screenshots when images/components load on scroll.
    """
    await page.evaluate("""
        async () => {
            await new Promise(resolve => {
                let total = 0;
                const distance = 200;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    total += distance;
                    if (total >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 50);
            });
            window.scrollTo(0, 0);
        }
    """)
    await page.wait_for_timeout(300)


async def capture(
    base_url: str,
    routes: list[str],
    viewport_names: list[str],
    output_dir: Path,
    full_page: bool = True,
    scroll_first: bool = True,
) -> None:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir = output_dir / timestamp
    run_dir.mkdir(parents=True, exist_ok=True)

    print(f"📸 Saving to {run_dir}/")

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        for vp_name in viewport_names:
            if vp_name not in VIEWPORTS:
                print(f"⚠️  Unknown viewport '{vp_name}', skipping")
                continue

            vp = VIEWPORTS[vp_name]
            context = await browser.new_context(
                viewport={"width": vp["width"], "height": vp["height"]},
                device_scale_factor=vp["device_scale_factor"],
            )
            page = await context.new_page()

            for route in routes:
                url = base_url.rstrip("/") + route
                slug = slugify_route(route)
                filename = run_dir / f"{slug}__{vp_name}.png"

                try:
                    print(f"  → {vp_name:7} {url}")
                    await page.goto(url, wait_until="domcontentloaded")
                    await wait_for_fonts_and_animations(page)

                    if scroll_first:
                        await auto_scroll(page)

                    await page.screenshot(path=str(filename), full_page=full_page)
                except Exception as e:
                    print(f"    ✗ Failed: {e}")

            await context.close()

        await browser.close()

    print(f"✓ Done. {len(routes) * len(viewport_names)} screenshots planned.")


# --- CLI ----------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Take screenshots of a website.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--routes", nargs="+", default=DEFAULT_ROUTES)
    parser.add_argument(
        "--viewports",
        nargs="+",
        default=list(VIEWPORTS.keys()),
        choices=list(VIEWPORTS.keys()),
    )
    parser.add_argument("--output", type=Path, default=OUTPUT_DIR)
    parser.add_argument("--no-full-page", action="store_true",
                        help="Only capture the viewport, not the full scrollable page")
    parser.add_argument("--no-scroll", action="store_true",
                        help="Skip the auto-scroll step (faster, but may miss lazy-loaded content)")
    args = parser.parse_args()

    asyncio.run(capture(
        base_url=args.base_url,
        routes=args.routes,
        viewport_names=args.viewports,
        output_dir=args.output,
        full_page=not args.no_full_page,
        scroll_first=not args.no_scroll,
    ))


if __name__ == "__main__":
    main()
