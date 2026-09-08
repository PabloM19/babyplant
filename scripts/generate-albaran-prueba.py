#!/usr/bin/env python3
"""Genera el albarán de prueba Eiviplant sobre la plantilla limpia."""

from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "public" / "albaran-plantilla-limpia.pdf"
OUTPUT = ROOT / "public" / "albaran-prueba-eiviplant.pdf"

LINES = [
    ("Rosa mini roja", 20, "ud", "2,40", "48,00"),
    ("Monstera Deliciosa", 15, "ud", "48,00", "720,00"),
    ("Geranio rojo", 30, "ud", "1,80", "54,00"),
    ("Olivo miniatura", 12, "ud", "36,00", "432,00"),
    ("Sansevieria trifasciata", 8, "ud", "32,00", "256,00"),
]

# Coordenadas extraídas de la plantilla (origen abajo-izquierda, A4)
HEADER = {
    "empresa": (118, 708.7),
    "domicilio_empresa": (295, 708.7),
    "nif_empresa": (445, 708.7),
    "cliente": (95, 618.0),
    "domicilio_cliente": (95, 594.7),
    "cp_ciudad": (130, 571.5),
    "albaran": (420, 666.1),
    "fecha": (420, 640.1),
    "pedido": (420, 614.0),
    "fecha_entrega": (420, 587.9),
    "lugar_entrega": (420, 561.8),
}

ROW_Y = [401.1, 378.4, 355.7, 333.1, 310.4]
COL = {
    "desc": 150,
    "qty": 330,
    "unit": 375,
    "price": 470,
    "total": 545,
}


def main() -> None:
    if not TEMPLATE.exists():
        raise SystemExit(f"No se encuentra la plantilla: {TEMPLATE}")

    packet = BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    c.setFont("Helvetica", 9)

    c.drawString(*HEADER["empresa"], "Viveros del Levante")
    c.drawString(*HEADER["domicilio_empresa"], "Polígono Agrícola 12, Valencia")
    c.drawString(*HEADER["nif_empresa"], "B-12345678")

    c.drawString(*HEADER["cliente"], "Eiviplant")
    c.drawString(*HEADER["domicilio_cliente"], "Ctra. Sant Antoni · km 2")
    c.drawString(*HEADER["cp_ciudad"], "07820 Sant Antoni de Portmany")

    c.drawString(*HEADER["albaran"], "VL-8841")
    c.drawString(*HEADER["fecha"], "8 mar 2026")
    c.drawString(*HEADER["pedido"], "PED-2026-0312")
    c.drawString(*HEADER["fecha_entrega"], "8 mar 2026")
    c.drawString(*HEADER["lugar_entrega"], "Garden center")

    for i, (desc, qty, unit, price, total) in enumerate(LINES):
        y = ROW_Y[i]
        c.drawString(COL["desc"], y, desc)
        c.drawRightString(COL["qty"], y, str(qty))
        c.drawString(COL["unit"], y, unit)
        c.drawRightString(COL["price"], y, price)
        c.drawRightString(COL["total"], y, total)

    c.save()
    packet.seek(0)

    overlay = PdfReader(packet)
    template = PdfReader(TEMPLATE)
    writer = PdfWriter()
    page = template.pages[0]
    page.merge_page(overlay.pages[0])
    writer.add_page(page)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("wb") as f:
        writer.write(f)

    print(f"Generado: {OUTPUT}")


if __name__ == "__main__":
    main()
