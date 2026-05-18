import io
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, KeepTogether
)
from app.models.trip import Trip, Message

AGENT_COLORS = {
    "Coordinator": "#6366f1",
    "Destination":  "#06b6d4",
    "Budget":       "#10b981",
    "Hotel":        "#f59e0b",
    "Itinerary":    "#ec4899",
}

NODE_PREFIXES = [
    "destination_node", "budget_node", "hotel_node",
    "itinerary_node", "coordinator_node", "router_node",
]


def clean_content(text: str) -> str:
    # Remove node prefixes
    for prefix in NODE_PREFIXES:
        if text.startswith(prefix):
            text = text[len(prefix):]
            break
    # Add newline before ## not preceded by newline
    text = re.sub(r'([^\n])(#{1,3} )', r'\1\n\2', text)
    # Add newline before bullet points
    text = re.sub(r'([^\n])(- )', r'\1\n\2', text)
    # Fix **Heading** alone on line preceded by content
    text = re.sub(r'([^\n])(\*\*[^*]+\*\*\n)', r'\1\n\2', text)
    return text.strip()


def md_to_reportlab(text: str) -> str:
    """Convert markdown bold to ReportLab XML tags."""
    # Replace **text** with <b>text</b>
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    # Escape & that are not part of tags
    text = re.sub(r'&(?!amp;|lt;|gt;|quot;)', '&amp;', text)
    return text


def parse_content(text: str, styles: dict) -> list:
    elements = []
    text = clean_content(text)
    lines = text.split("\n")

    for line in lines:
        line = line.rstrip()

        if line.startswith("## "):
            content = md_to_reportlab(line[3:])
            elements.append(Spacer(1, 6))
            elements.append(Paragraph(content, styles["h2"]))
            elements.append(Spacer(1, 3))

        elif line.startswith("### "):
            content = md_to_reportlab(line[4:])
            elements.append(Paragraph(content, styles["h3"]))
            elements.append(Spacer(1, 2))

        elif re.match(r'^\*\*[^*]+\*\*:?\s*$', line.strip()):
            # **Bold heading** alone on line → treat as h3
            content = line.replace("**", "").replace(":", "").strip()
            elements.append(Spacer(1, 4))
            elements.append(Paragraph(content, styles["h3"]))
            elements.append(Spacer(1, 2))

        elif line.startswith("- ") or line.startswith("* "):
            content = md_to_reportlab(line[2:])
            elements.append(Paragraph(f"• {content}", styles["bullet"]))

        elif line.strip() == "---":
            elements.append(Spacer(1, 6))
            elements.append(HRFlowable(
                width="100%", thickness=0.5,
                color=HexColor("#e2e8f0"), spaceAfter=6
            ))

        elif line.strip() == "":
            elements.append(Spacer(1, 4))

        else:
            content = md_to_reportlab(line)
            elements.append(Paragraph(content, styles["body"]))

    return elements


def build_styles() -> dict:
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=10, leading=15,
            textColor=HexColor("#475569"), spaceAfter=3,
        ),
        "bullet": ParagraphStyle(
            "bullet", parent=base["Normal"],
            fontSize=10, leading=14,
            textColor=HexColor("#475569"),
            leftIndent=14, spaceAfter=3,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Normal"],
            fontSize=13, leading=18,
            fontName="Helvetica-Bold",
            textColor=HexColor("#1e293b"),
            spaceAfter=4, spaceBefore=8,
        ),
        "h3": ParagraphStyle(
            "h3", parent=base["Normal"],
            fontSize=11, leading=16,
            fontName="Helvetica-Bold",
            textColor=HexColor("#334155"),
            spaceAfter=3, spaceBefore=6,
        ),
        "agent_label": ParagraphStyle(
            "agent_label", parent=base["Normal"],
            fontSize=8, leading=10,
            fontName="Helvetica-Bold",
            textColor=white,
        ),
        "cover_title": ParagraphStyle(
            "cover_title", parent=base["Normal"],
            fontSize=28, leading=34,
            fontName="Helvetica",
            textColor=white, spaceAfter=6,
        ),
        "cover_dest": ParagraphStyle(
            "cover_dest", parent=base["Normal"],
            fontSize=13, leading=18,
            textColor=HexColor("#94a3b8"), spaceAfter=0,
        ),
        "meta_label": ParagraphStyle(
            "meta_label", parent=base["Normal"],
            fontSize=7, fontName="Helvetica-Bold",
            textColor=HexColor("#64748b"), spaceAfter=2,
        ),
        "meta_value": ParagraphStyle(
            "meta_value", parent=base["Normal"],
            fontSize=13, fontName="Helvetica-Bold",
            textColor=HexColor("#e2e8f0"),
        ),
        "section_label": ParagraphStyle(
            "section_label", parent=base["Normal"],
            fontSize=8, fontName="Helvetica-Bold",
            textColor=HexColor("#94a3b8"), spaceAfter=6,
        ),
        "badge": ParagraphStyle(
            "badge", parent=base["Normal"],
            fontSize=7, fontName="Helvetica-Bold",
            textColor=HexColor("#60a5fa"),
        ),
    }


def generate_itinerary_pdf(trip: Trip, messages: list[Message]) -> bytes:
    buffer = io.BytesIO()
    W = 180 * mm

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=15 * mm, leftMargin=15 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title=trip.title, author="VoyageAI",
    )

    styles = build_styles()
    elements = []

    # ── Cover ────────────────────────────────────────────────────
    elements.append(Table(
        [[Paragraph("AI-GENERATED ITINERARY · VOYAGEAI", styles["badge"])]],
        colWidths=[W],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#172554")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 16),
            ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ]),
    ))

    elements.append(Table(
        [
            [Paragraph(trip.title, styles["cover_title"])],
            [Paragraph(trip.destination, styles["cover_dest"])],
        ],
        colWidths=[W],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#0a0a1a")),
            ("TOPPADDING", (0, 0), (-1, -1), 24),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 24),
            ("LEFTPADDING", (0, 0), (-1, -1), 16),
            ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ]),
    ))

    # Meta row
    meta = [
        ("DURATION", f"{trip.duration_days} days"),
        ("BUDGET", f"{trip.currency} {float(trip.budget):,.0f}"),
        ("STATUS", trip.status.value.upper()),
    ]
    meta_cells = []
    for label, value in meta:
        meta_cells.append(Table(
            [[Paragraph(label, styles["meta_label"])],
             [Paragraph(value, styles["meta_value"])]],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), HexColor("#111827")),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("LEFTPADDING", (0, 0), (-1, -1), 16),
                ("RIGHTPADDING", (0, 0), (-1, -1), 16),
            ]),
        ))

    elements.append(Table(
        [meta_cells],
        colWidths=[W / 3, W / 3, W / 3],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), HexColor("#111827")),
            ("LINEAFTER", (0, 0), (1, 0), 0.5, HexColor("#1e293b")),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]),
    ))

    elements.append(Spacer(1, 20))

    # ── Agent messages ────────────────────────────────────────────
    agent_messages = [m for m in messages if m.role == "agent" and m.content.strip()]

    if not agent_messages:
        elements.append(Paragraph(
            "No itinerary generated yet. Start chatting with agents to build your trip plan.",
            styles["body"],
        ))
    else:
        for msg in agent_messages:
            color_hex = AGENT_COLORS.get(msg.agent_name or "Coordinator", "#6366f1")
            color = HexColor(color_hex)

            block = []

            # Agent label
            block.append(Table(
                [[Paragraph((msg.agent_name or "Agent").upper(), styles["agent_label"])]],
                colWidths=[W],
                style=TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), color),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 12),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ]),
            ))
            block.append(Spacer(1, 6))
            block.extend(parse_content(msg.content, styles))
            block.append(Spacer(1, 16))

            elements.append(KeepTogether(block[:4]))
            elements.extend(block[4:])

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()