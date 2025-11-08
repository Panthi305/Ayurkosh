from flask import Blueprint, request, jsonify, Response
import requests
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from io import BytesIO
import logging
import urllib.request
from urllib.request import urlopen
from reportlab.lib.utils import ImageReader
import re
import ssl
from datetime import datetime

plant_bp = Blueprint("plant", __name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

API_URL = "https://plant-api-buj0.onrender.com/api/plant"
API_KEY = "mysecretkey123"  # Replace with actual secret if needed

# Create an unverified SSL context to bypass certificate verification (temporary workaround)
ssl_context = ssl._create_unverified_context()

# ---------- Helper Function ----------
def fetch_plant_data(plant_name):
    """Fetch plant data from the remote API."""
    try:
        response = requests.get(
            API_URL,
            params={"name": plant_name},
            headers={"x-api-key": API_KEY}
        )
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            return None
        else:
            raise Exception(f"API error {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"Error fetching plant data: {str(e)}", exc_info=True)
        raise

# ---------- Custom Canvas for Header and Footer ----------
def add_header_footer(canvas, doc):
    """Add header and footer to each page."""
    canvas.saveState()
    
    # Header
    canvas.setFillColor(colors.darkgreen)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(0.75*inch, doc.pagesize[1] - 0.5*inch, "Plant Information Report")
    
    # Footer
    canvas.setFillColor(colors.grey)
    canvas.setFont("Helvetica", 8)
    footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y')} | Page {doc.page}"
    canvas.drawString(0.75*inch, 0.5*inch, footer_text)
    
    # Divider lines
    canvas.setStrokeColor(colors.darkgreen)
    canvas.setLineWidth(0.5)
    canvas.line(0.75*inch, doc.pagesize[1] - 0.6*inch, doc.pagesize[0] - 0.75*inch, doc.pagesize[1] - 0.6*inch)
    canvas.line(0.75*inch, 0.6*inch, doc.pagesize[0] - 0.75*inch, 0.6*inch)
    
    canvas.restoreState()

# ---------- Endpoints ----------

@plant_bp.route("/api/search-plant", methods=["GET"])
def search_plant():
    plant_name = request.args.get("name", "").strip()
    if not plant_name:
        return jsonify({"error": "Plant name is required"}), 400

    try:
        plant = fetch_plant_data(plant_name)
        if plant:
            return jsonify(plant), 200
        else:
            return jsonify({"error": "Plant not found"}), 404
    except Exception as e:
        logger.error(f"Exception in search_plant: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

@plant_bp.route('/api/generate-pdf', methods=['GET', 'OPTIONS'])
def generate_pdf():
    if request.method == 'OPTIONS':
        response = Response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Content-Disposition, X-Requested-With, Authorization')
        response.headers.add('Access-Control-Max-Age', '86400')
        return response, 200

    name = request.args.get('name')
    if not name:
        logger.error("No plant name provided")
        return jsonify({"error": "Plant name is required"}), 400

    try:
        logger.debug(f"Generating PDF for plant: {name}")

        # Fetch plant data
        plant = fetch_plant_data(name)
        if not plant:
            logger.error(f"Plant '{name}' not found in API")
            return jsonify({"error": "Plant not found"}), 404
        logger.debug(f"Plant data: {plant}")

        # Validate required fields
        if not plant.get('common_name'):
            logger.error(f"Plant data missing common_name: {plant}")
            return jsonify({"error": "Invalid plant data: missing common_name"}), 400

        # Generate PDF with enhanced styling
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=1*inch
        )
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            name='TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=32,
            leading=36,
            alignment=1,  # Center
            spaceAfter=12,
            textColor=colors.HexColor('#2E7D32')  # Dark green
        )
        subtitle_style = ParagraphStyle(
            name='SubtitleStyle',
            parent=styles['Heading2'],
            fontName='Helvetica-Oblique',
            fontSize=16,
            leading=20,
            alignment=1,  # Center
            spaceAfter=16,
            textColor=colors.HexColor('#4B5EAA')  # Soft blue
        )
        section_style = ParagraphStyle(
            name='SectionStyle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            spaceBefore=16,
            spaceAfter=10,
            textColor=colors.HexColor('#2E7D32'),
            backColor=colors.HexColor('#E8F5E9')  # Light green background
        )
        item_style = ParagraphStyle(
            name='ItemStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            leftIndent=20,
            spaceAfter=8,
            textColor=colors.black,
            firstLineIndent=-10
        )
        caption_style = ParagraphStyle(
            name='CaptionStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=12,
            alignment=1,  # Center
            spaceAfter=12,
            textColor=colors.grey
        )

        elements = []

        # Title and Subtitle
        elements.append(Paragraph(plant.get('common_name', 'Unknown Plant'), title_style))
        elements.append(Paragraph(plant.get('botanical_name', 'Not available'), subtitle_style))
        elements.append(Spacer(1, 0.3*inch))

        # Image
        images = plant.get('images', [])
        logger.debug(f"Images field: {images}")
        image_added = False
        if images and isinstance(images, list) and len(images) > 0:
            for img_url in images:
                if not img_url or not isinstance(img_url, str):
                    logger.warning(f"Skipping invalid image URL: {img_url}")
                    continue
                if not re.match(r'.*\.(jpe?g|png|gif|webp|svg|bmp|ico|cms)$', img_url, re.IGNORECASE):
                    logger.warning(f"Image URL does not match supported formats: {img_url}")
                    continue
                try:
                    logger.debug(f"Attempting to fetch image from: {img_url}")
                    req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                    img_data = urlopen(req, context=ssl_context, timeout=10).read()
                    img_bytes = BytesIO(img_data)
                    img_reader = ImageReader(img_bytes)
                    img_width = 3*inch
                    aspect = img_reader.getSize()[1] / float(img_reader.getSize()[0])
                    img_height = img_width * aspect
                    if img_height > 3*inch:
                        img_height = 3*inch
                        img_width = img_height / aspect
                    image = Image(img_bytes, width=img_width, height=img_height)
                    image.hAlign = 'CENTER'
                    elements.append(image)
                    elements.append(Paragraph("Plant Image", caption_style))
                    image_added = True
                    logger.debug(f"Successfully added image: {img_url}")
                    break
                except Exception as e:
                    logger.warning(f"Failed to include image {img_url}: {str(e)}")
        if not image_added:
            elements.append(Paragraph("No image available", caption_style))
        elements.append(Spacer(1, 0.3*inch))

        # Family
        elements.append(Paragraph(f"<b>Family:</b> {plant.get('family', 'Not available')}", item_style))
        elements.append(Spacer(1, 0.4*inch))

        # Ratings Table
        ratings_data = [["Rating", "Value"]]
        ratings = [
            ('Eligibility Rating', plant.get('eligibility_rating')),
            ('Medical Rating', plant.get('medical_rating')),
            ('Other Uses Rating', plant.get('other_uses_rating'))
        ]
        for label, value in ratings:
            if value is not None:
                try:
                    value = int(value) if isinstance(value, (int, float)) else 0
                    value = max(0, min(5, value))
                    stars = '★' * value + '☆' * (5 - value)
                    ratings_data.append([label, stars])
                except (ValueError, TypeError):
                    logger.warning(f"Invalid rating value for {label}: {value}")
                    ratings_data.append([label, "N/A"])
        if len(ratings_data) > 1:
            ratings_table = Table(ratings_data, colWidths=[3.5*inch, 2*inch])
            ratings_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F1F8E9')),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#2E7D32')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10)
            ]))
            elements.append(ratings_table)
        elements.append(Spacer(1, 0.4*inch))

        # Sections
        for section_name, items in {
            "Summary": [
                ("Overview", plant.get('summary', 'No summary available')),
                ("Genus", plant.get('genus')),
                ("Flowering Season", plant.get('flowering_season')),
                ("Fruiting Season", plant.get('fruiting_season')),
                ("Conservation Status", plant.get('conservation_status')),
                ("Featured", "Yes" if plant.get('featured') else "No")
            ],
            "Cultivation": [
                ("Sun Exposure", plant.get('sun_exposure')),
                ("Soil Type", plant.get('soil_type')),
                ("Water Needs", plant.get('water_needs')),
                ("Temperature Range", plant.get('temperature_range')),
                ("Harvesting Time", plant.get('harvesting_time')),
                ("Propagation Methods", plant.get('propagation_methods')),
                ("Care Tips", plant.get('care_tips')),
                ("Additional Details", plant.get('cultivation_details'))
            ],
            "Medicinal": [
                ("Medicinal Uses", plant.get('medicinal_uses')),
                ("Medicinal Properties", plant.get('medicinal_properties')),
                ("Edible Parts", plant.get('edible_parts')),
                ("Edible Uses", plant.get('edible_uses')),
                ("Other Uses", plant.get('other_uses')),
                ("Usage Parts", plant.get('usage_parts')),
                ("Medicinal Description", plant.get('medicinal_description')),
                ("Edible Description", plant.get('edible_parts_description'))
            ],
            "Botanical": [
                ("Plant Type", plant.get('plant_type')),
                ("Leaf Type", plant.get('leaf_type')),
                ("Habit", plant.get('habit')),
                ("USDA Hardiness Zone", plant.get('usda_hardiness_zone')),
                ("Physical Characteristics", plant.get('physical_characteristics'))
            ],
            "Hazards": [
                ("Known Hazards", plant.get('known_hazards', 'No known hazards recorded')),
                ("Storage", plant.get('storage')),
                ("Weed Potential", plant.get('weed_potential'))
            ],
            "Distribution": [
                ("Native Range", plant.get('native_range', 'No distribution information available')),
                ("Other Names", plant.get('other_names')),
                ("Traditional Systems", plant.get('traditional_systems')),
                ("Search Tags", plant.get('search_tags')),
                ("Slug", plant.get('slug'))
            ]
        }.items():
            elements.append(Paragraph(section_name, section_style))
            section_items = []
            for label, value in items:
                if value is not None:
                    text = f"<b>{label}:</b> {', '.join(str(v) for v in value) if isinstance(value, (list, tuple)) else str(value)}"
                    section_items.append(Paragraph(text, item_style))
            if section_items:
                elements.extend(section_items)
            elements.append(Spacer(1, 0.25*inch))

        # Build the PDF with header and footer
        doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)

        # Return PDF as response with CORS headers
        buffer.seek(0)
        response = Response(buffer, mimetype='application/pdf', headers={
            'Content-Disposition': f'attachment; filename={name}_Plant_Report.pdf'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        logger.debug("PDF generation successful")
        return response

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate PDF", "details": str(e)}), 500