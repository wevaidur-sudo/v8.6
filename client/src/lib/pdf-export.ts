import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type Kundli } from "@shared/astro-schema";

/**
 * Generate a comprehensive PDF report of the Kundli
 */
export async function generateKundliPDF(kundli: Kundli): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Title Page
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("ParāSara-X", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text("Vedic Astrology Report", pageWidth / 2, yPos, { align: "center" });

  yPos += 20;
  
  // Birth Details
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Birth Details", margin, yPos);
  yPos += 8;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  const birthDetails = [
    `Name: ${kundli.birthData.name}`,
    `Date of Birth: ${kundli.birthData.dateOfBirth}`,
    `Time of Birth: ${kundli.birthData.timeOfBirth}`,
    `Place of Birth: ${kundli.birthData.placeOfBirth}`,
    `Latitude: ${kundli.birthData.latitude.toFixed(4)}°`,
    `Longitude: ${kundli.birthData.longitude.toFixed(4)}°`,
    `Ascendant: ${kundli.chartData.ascendant}`,
  ];

  for (const detail of birthDetails) {
    pdf.text(detail, margin, yPos);
    yPos += 6;
  }

  yPos += 10;

  // Planetary Positions
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Planetary Positions", margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  // Table headers
  const headers = ["Planet", "Sign", "Degree", "House", "Nakshatra", "Dignity"];
  const colWidths = [30, 30, 25, 20, 35, 40];
  let xPos = margin;

  pdf.setFont("helvetica", "bold");
  headers.forEach((header, i) => {
    pdf.text(header, xPos, yPos);
    xPos += colWidths[i];
  });
  yPos += 6;

  // Draw line
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;

  // Planet data
  pdf.setFont("helvetica", "normal");
  for (const planet of kundli.chartData.planetPositions) {
    if (planet.planet === "Ascendant") continue;
    
    xPos = margin;
    const row = [
      planet.planet,
      planet.sign,
      `${planet.degree.toFixed(2)}°`,
      planet.house.toString(),
      planet.nakshatra,
      planet.dignity,
    ];

    row.forEach((cell, i) => {
      pdf.text(cell, xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += 5;

    // Check for new page
    if (yPos > pageHeight - margin - 20) {
      pdf.addPage();
      yPos = margin;
    }
  }

  yPos += 10;

  // Yogas
  if (kundli.yogas.length > 0) {
    if (yPos > pageHeight - margin - 40) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Yogas & Special Combinations", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const yoga of kundli.yogas) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${yoga.name} (${yoga.strength})`, margin, yPos);
      yPos += 5;

      pdf.setFont("helvetica", "normal");
      const description = pdf.splitTextToSize(yoga.description, pageWidth - 2 * margin);
      pdf.text(description, margin + 5, yPos);
      yPos += description.length * 5 + 3;

      const effects = pdf.splitTextToSize(yoga.effects, pageWidth - 2 * margin);
      pdf.text(effects, margin + 5, yPos);
      yPos += effects.length * 5 + 8;

      if (yPos > pageHeight - margin - 30) {
        pdf.addPage();
        yPos = margin;
      }
    }
  }

  // Dasha System
  if (yPos > pageHeight - margin - 50) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Vimshottari Dasha", margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Birth Dasha: ${kundli.dashaSystem.birthDasha} (${kundli.dashaSystem.birthDashaBalance.toFixed(2)} years remaining)`, margin, yPos);
  yPos += 8;

  if (kundli.dashaSystem.currentMahadasha) {
    pdf.text(`Current Mahadasha: ${kundli.dashaSystem.currentMahadasha.planet}`, margin, yPos);
    yPos += 5;
    pdf.text(`Period: ${kundli.dashaSystem.currentMahadasha.startDate.toLocaleDateString()} - ${kundli.dashaSystem.currentMahadasha.endDate.toLocaleDateString()}`, margin + 5, yPos);
    yPos += 8;
  }

  if (kundli.dashaSystem.currentAntardasha) {
    pdf.text(`Current Antardasha: ${kundli.dashaSystem.currentAntardasha.planet}`, margin, yPos);
    yPos += 10;
  }

  // Personality Analysis
  if (yPos > pageHeight - margin - 60) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Personality Analysis", margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  const ascendantText = pdf.splitTextToSize(
    kundli.interpretations.personality.ascendantAnalysis,
    pageWidth - 2 * margin
  );
  pdf.text(ascendantText, margin, yPos);
  yPos += ascendantText.length * 5 + 8;

  if (yPos > pageHeight - margin - 30) {
    pdf.addPage();
    yPos = margin;
  }

  const sunText = pdf.splitTextToSize(
    kundli.interpretations.personality.sunSignAnalysis,
    pageWidth - 2 * margin
  );
  pdf.text(sunText, margin, yPos);
  yPos += sunText.length * 5 + 8;

  if (yPos > pageHeight - margin - 30) {
    pdf.addPage();
    yPos = margin;
  }

  const moonText = pdf.splitTextToSize(
    kundli.interpretations.personality.moonSignAnalysis,
    pageWidth - 2 * margin
  );
  pdf.text(moonText, margin, yPos);
  yPos += moonText.length * 5 + 10;

  // Remedies
  if (yPos > pageHeight - margin - 50) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Personalized Remedies", margin, yPos);
  yPos += 8;

  // Gemstones
  if (kundli.remedies.gemstones.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Gemstone Recommendations:", margin, yPos);
    yPos += 6;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const gem of kundli.remedies.gemstones) {
      pdf.text(`${gem.planet}: ${gem.primaryGemstone}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Weight: ${gem.weight}, Metal: ${gem.metal}, Finger: ${gem.finger}`, margin + 10, yPos);
      yPos += 5;
      pdf.text(`Day to wear: ${gem.dayToWear}`, margin + 10, yPos);
      yPos += 8;

      if (yPos > pageHeight - margin - 30) {
        pdf.addPage();
        yPos = margin;
      }
    }
  }

  // Mantras
  if (kundli.remedies.mantras.length > 0) {
    if (yPos > pageHeight - margin - 40) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Mantra Recommendations:", margin, yPos);
    yPos += 6;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    for (const mantra of kundli.remedies.mantras) {
      pdf.text(`${mantra.planet}: ${mantra.mantra}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Repetitions: ${mantra.repetitions}, Time: ${mantra.bestTime}, Duration: ${mantra.duration}`, margin + 10, yPos);
      yPos += 8;

      if (yPos > pageHeight - margin - 30) {
        pdf.addPage();
        yPos = margin;
      }
    }
  }

  // Footer on last page
  const totalPages = pdf.internal.pages.length - 1; // Subtract 1 for the internal pages array
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Generated by ParāSara-X | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  pdf.save(`${kundli.birthData.name.replace(/\s+/g, "_")}_Kundli.pdf`);
}

/**
 * Capture a DOM element as an image and add to PDF
 * Useful for capturing charts
 */
export async function captureElementAsPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#14110F",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
