"""
NHS Medicines A-Z Scraper
=========================
Scrapes https://www.nhs.uk/medicines/ and stores all medicine data in a
SQLite database at  data/nhs_medicines.db

Database schema
---------------
medicines
    id              INTEGER PRIMARY KEY
    name            TEXT        -- display name  (e.g. "Paracetamol for adults")
    slug            TEXT UNIQUE -- URL slug       (e.g. "paracetamol-for-adults")
    url             TEXT        -- full landing page URL
    brand_names     TEXT        -- comma-separated brand names (may be NULL)
    description     TEXT        -- intro paragraph from landing page
    related_conditions TEXT     -- JSON array of related condition names
    scraped_at      TEXT        -- ISO timestamp

medicine_sections
    id              INTEGER PRIMARY KEY
    medicine_id     INTEGER REFERENCES medicines(id)
    section_name    TEXT        -- normalised key (about, side_effects, …)
    section_title   TEXT        -- original heading text
    section_url     TEXT        -- full sub-page URL
    content         TEXT        -- extracted text content (markdown-ish)
    scraped_at      TEXT        -- ISO timestamp

Usage:
    conda run -n medicine_ml python scrape_nhs_medicines.py

The scraper is resumable — it skips medicines/sections already in the DB.
"""

import json
import os
import re
import sqlite3
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag

# ── Config ────────────────────────────────────────────────────────────────────

BASE_URL = "https://www.nhs.uk"
INDEX_URL = f"{BASE_URL}/medicines/"
DB_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = DB_DIR / "nhs_medicines.db"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
}

# Polite delay between requests (seconds)
DELAY = 1.0

# ── Database helpers ──────────────────────────────────────────────────────────


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS medicines (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            name                TEXT    NOT NULL,
            slug                TEXT    NOT NULL UNIQUE,
            url                 TEXT    NOT NULL,
            brand_names         TEXT,
            description         TEXT,
            related_conditions  TEXT,
            scraped_at          TEXT
        );

        CREATE TABLE IF NOT EXISTS medicine_sections (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_id     INTEGER NOT NULL REFERENCES medicines(id),
            section_name    TEXT    NOT NULL,
            section_title   TEXT,
            section_url     TEXT,
            content         TEXT,
            scraped_at      TEXT,
            UNIQUE(medicine_id, section_name)
        );
        """
    )
    conn.commit()


def medicine_exists(conn: sqlite3.Connection, slug: str) -> int | None:
    """Return medicine id if already scraped, else None."""
    row = conn.execute(
        "SELECT id FROM medicines WHERE slug = ?", (slug,)
    ).fetchone()
    return row[0] if row else None


def section_exists(conn: sqlite3.Connection, med_id: int, section_name: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM medicine_sections WHERE medicine_id = ? AND section_name = ?",
        (med_id, section_name),
    ).fetchone()
    return row is not None


# ── HTTP helpers ──────────────────────────────────────────────────────────────

session = requests.Session()
session.headers.update(HEADERS)


def fetch(url: str, retries: int = 3) -> BeautifulSoup | None:
    """Fetch a URL and return parsed BeautifulSoup, with retries."""
    for attempt in range(retries):
        try:
            resp = session.get(url, timeout=30)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
        except requests.RequestException as exc:
            print(f"  [!] Attempt {attempt + 1}/{retries} failed for {url}: {exc}")
            if attempt < retries - 1:
                time.sleep(DELAY * (attempt + 1))
    return None


# ── Parsing: A-Z index ────────────────────────────────────────────────────────


def parse_medicine_links(soup: BeautifulSoup) -> list[dict]:
    """
    Extract all medicine links from the A-Z index page.
    Returns list of {name, slug, url}.
    """
    medicines: list[dict] = []
    seen_slugs: set[str] = set()

    # Each letter card: <div class="nhsuk-card--feature"> -> <ul> -> <li> -> <a>
    for link in soup.select("ul.nhsuk-list--links a[href^='/medicines/']"):
        href = link.get("href", "").strip()
        name = link.get_text(strip=True)

        # Build full URL
        full_url = urljoin(BASE_URL, href)

        # Extract slug:  /medicines/paracetamol-for-adults/  -> paracetamol-for-adults
        slug_match = re.match(r"/medicines/([^/]+)/?", href)
        if not slug_match:
            continue
        slug = slug_match.group(1)

        # Deduplicate (some medicines listed under multiple letters)
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        medicines.append({"name": name, "slug": slug, "url": full_url})

    return medicines


# ── Parsing: medicine landing page ────────────────────────────────────────────


def extract_brand_names(heading_text: str) -> str | None:
    """
    Extract brand names from heading like:
    "About paracetamol for adults - Brand names: Disprol, Hedex, Medinol, Panadol"
    """
    m = re.search(r"Brand names?:\s*(.+)", heading_text, re.IGNORECASE)
    return m.group(1).strip() if m else None


def parse_landing_page(soup: BeautifulSoup) -> dict:
    """
    Parse a medicine landing page to extract:
    - brand_names, description, sub-page links, related_conditions
    """
    data: dict = {
        "brand_names": None,
        "description": None,
        "sub_pages": [],          # [{section_name, section_title, url}]
        "related_conditions": [],
    }

    # Brand names from h1
    h1 = soup.select_one("h1")
    if h1:
        data["brand_names"] = extract_brand_names(h1.get_text())

    # Main content area
    main = soup.select_one("main") or soup

    # Description: first <p> in main that is not inside a nav/list
    for p in main.select("p"):
        text = p.get_text(strip=True)
        if text and len(text) > 20 and not p.find_parent("nav"):
            data["description"] = text
            break

    # Sub-page links — they are in a <ul> following the description
    # Pattern: <a href="/medicines/slug/sub-page-slug/">Section Title</a>
    for a_tag in main.select("a[href]"):
        href = a_tag.get("href", "")
        title = a_tag.get_text(strip=True)

        # Only medicine sub-pages (at least 2 path segments under /medicines/)
        if not re.match(r"(https?://www\.nhs\.uk)?/medicines/[^/]+/[^/]+", href):
            continue

        # Skip "Back to ..." links
        if title.lower().startswith("back to"):
            continue

        # Normalise section name
        section_name = normalise_section_name(title)
        full_url = urljoin(BASE_URL, href)

        # Avoid duplicates
        if any(sp["section_url"] == full_url for sp in data["sub_pages"]):
            continue

        data["sub_pages"].append({
            "section_name": section_name,
            "section_title": title,
            "section_url": full_url,
        })

    # Related conditions
    for heading in main.find_all(["h2", "h3"]):
        if "related conditions" in heading.get_text(strip=True).lower():
            ul = heading.find_next_sibling("ul")
            if ul:
                for li in ul.find_all("li"):
                    text = li.get_text(strip=True)
                    if text:
                        data["related_conditions"].append(text)
            break

    return data


def normalise_section_name(title: str) -> str:
    """Convert a section title to a snake_case key."""
    t = title.lower().strip()
    # Common patterns
    mappings = [
        (r"^about\b", "about"),
        (r"who can and cannot", "who_can_take"),
        (r"how and when to take", "how_to_take"),
        (r"how to take", "how_to_take"),
        (r"how to use", "how_to_use"),
        (r"^dosage$", "dosage"),
        (r"side effect", "side_effects"),
        (r"pregnan", "pregnancy"),
        (r"breastfeed", "pregnancy"),
        (r"taking .+ with other", "interactions"),
        (r"using .+ with other", "interactions"),
        (r"common question", "common_questions"),
        (r"caution", "cautions"),
        (r"^key fact", "key_facts"),
        (r"doses? and how long to take", "dosage"),
    ]
    for pattern, name in mappings:
        if re.search(pattern, t):
            return name

    # Fallback: slugify
    slug = re.sub(r"[^a-z0-9]+", "_", t).strip("_")
    return slug[:80] or "other"


# ── Parsing: section sub-page ─────────────────────────────────────────────────


def extract_section_content(soup: BeautifulSoup) -> str:
    """
    Extract the main textual content from a medicine section page.
    Returns cleaned text preserving structure with markdown-like formatting.
    """
    main = soup.select_one("main") or soup

    # Remove navigation, footer, breadcrumb, related-content-like blocks
    for tag in main.select(
        "nav, .nhsuk-breadcrumb, .nhsuk-back-to-top, "
        ".nhsuk-related-nav, footer, script, style, "
        ".nhsuk-review-date, .nhsuk-u-visually-hidden"
    ):
        tag.decompose()

    # Remove the "More in [Medicine Name]" section (it's nav)
    for h2 in main.find_all("h2"):
        if h2.get_text(strip=True).lower().startswith("more in"):
            # Remove the heading and the following ul
            sib = h2.find_next_sibling()
            if sib and sib.name == "ul":
                sib.decompose()
            h2.decompose()

    # Remove support links section
    for h2 in main.find_all("h2"):
        if "support links" in h2.get_text(strip=True).lower():
            # Remove everything from here down
            for sib in list(h2.find_next_siblings()):
                sib.decompose()
            h2.decompose()

    lines: list[str] = []
    for element in main.descendants:
        if isinstance(element, Tag):
            tag_name = element.name
            text = element.get_text(strip=True)
            if not text:
                continue

            # Headings
            if tag_name in ("h1", "h2", "h3", "h4"):
                prefix = "#" * int(tag_name[1])
                line = f"{prefix} {text}"
                if line not in lines:
                    lines.append("")
                    lines.append(line)
                    lines.append("")

            # List items
            elif tag_name == "li" and element.parent and element.parent.name in ("ul", "ol"):
                line = f"- {text}"
                if line not in lines:
                    lines.append(line)

            # Paragraphs and divs with direct text (not already captured)
            elif tag_name == "p":
                if text not in "\n".join(lines):
                    lines.append(text)
                    lines.append("")

    # Clean up
    result = "\n".join(lines).strip()
    # Collapse multiple blank lines
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result


# ── Main scraping logic ──────────────────────────────────────────────────────


def scrape_all() -> None:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    init_db(conn)

    now = datetime.now(timezone.utc).isoformat()

    # Step 1: Get all medicine links from A-Z index
    print("=" * 60)
    print("NHS Medicines A-Z Scraper")
    print("=" * 60)
    print(f"\nFetching index: {INDEX_URL}")
    index_soup = fetch(INDEX_URL)
    if not index_soup:
        print("[FATAL] Could not fetch the medicines index page.")
        sys.exit(1)

    medicines = parse_medicine_links(index_soup)
    print(f"Found {len(medicines)} unique medicines in the A-Z index.\n")

    # Step 2: Scrape each medicine
    total = len(medicines)
    for i, med in enumerate(medicines, 1):
        slug = med["slug"]
        name = med["name"]
        url = med["url"]

        print(f"[{i}/{total}] {name}")

        # Check if already in DB
        existing_id = medicine_exists(conn, slug)
        if existing_id:
            print(f"  -> Already in DB (id={existing_id}), checking sections...")
            med_id = existing_id
        else:
            # Fetch landing page
            time.sleep(DELAY)
            landing_soup = fetch(url)
            if not landing_soup:
                print(f"  [!] Failed to fetch landing page, skipping.")
                continue

            landing_data = parse_landing_page(landing_soup)

            # Insert medicine
            try:
                cur = conn.execute(
                    """
                    INSERT INTO medicines (name, slug, url, brand_names, description,
                                           related_conditions, scraped_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        name,
                        slug,
                        url,
                        landing_data["brand_names"],
                        landing_data["description"],
                        json.dumps(landing_data["related_conditions"]),
                        now,
                    ),
                )
                conn.commit()
                med_id = cur.lastrowid
                print(f"  -> Inserted medicine (id={med_id})")
            except sqlite3.IntegrityError:
                # Race condition / duplicate
                med_id = medicine_exists(conn, slug)
                print(f"  -> Already exists (id={med_id})")

            # Scrape sub-pages
            sub_pages = landing_data["sub_pages"]
            if not sub_pages:
                print(f"  -> No sub-pages found.")
                continue

            for sp in sub_pages:
                sec_name = sp["section_name"]
                sec_title = sp["section_title"]
                sec_url = sp["section_url"]

                if section_exists(conn, med_id, sec_name):
                    print(f"     [{sec_name}] already scraped, skipping.")
                    continue

                time.sleep(DELAY)
                sec_soup = fetch(sec_url)
                if not sec_soup:
                    print(f"     [{sec_name}] FAILED to fetch.")
                    continue

                content = extract_section_content(sec_soup)

                try:
                    conn.execute(
                        """
                        INSERT INTO medicine_sections
                            (medicine_id, section_name, section_title, section_url, content, scraped_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (med_id, sec_name, sec_title, sec_url, content, now),
                    )
                    conn.commit()
                    chars = len(content)
                    print(f"     [{sec_name}] OK ({chars} chars)")
                except sqlite3.IntegrityError:
                    print(f"     [{sec_name}] already exists, skipping.")

            continue  # next medicine — sub-pages already handled above

        # If medicine already existed, still check for missing sections
        time.sleep(DELAY)
        landing_soup = fetch(url)
        if not landing_soup:
            print(f"  [!] Failed to re-fetch landing page for section check.")
            continue

        landing_data = parse_landing_page(landing_soup)
        sub_pages = landing_data["sub_pages"]

        for sp in sub_pages:
            sec_name = sp["section_name"]
            sec_title = sp["section_title"]
            sec_url = sp["section_url"]

            if section_exists(conn, med_id, sec_name):
                continue

            time.sleep(DELAY)
            sec_soup = fetch(sec_url)
            if not sec_soup:
                print(f"     [{sec_name}] FAILED to fetch.")
                continue

            content = extract_section_content(sec_soup)

            try:
                conn.execute(
                    """
                    INSERT INTO medicine_sections
                        (medicine_id, section_name, section_title, section_url, content, scraped_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (med_id, sec_name, sec_title, sec_url, content, now),
                )
                conn.commit()
                chars = len(content)
                print(f"     [{sec_name}] OK ({chars} chars)")
            except sqlite3.IntegrityError:
                pass

    # Summary
    print("\n" + "=" * 60)
    med_count = conn.execute("SELECT COUNT(*) FROM medicines").fetchone()[0]
    sec_count = conn.execute("SELECT COUNT(*) FROM medicine_sections").fetchone()[0]
    print(f"Done!  {med_count} medicines,  {sec_count} sections stored.")
    print(f"Database: {DB_PATH}")
    print("=" * 60)

    conn.close()


if __name__ == "__main__":
    scrape_all()
