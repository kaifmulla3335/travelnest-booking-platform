package com.travelnest.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.travelnest.backend.entity.Booking;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Generates two distinct PDF documents for a booking:
 *
 *  - RECEIPT  — "Payment Receipt / Booking Acknowledgement". Available any time after
 *               payment, regardless of booking status. No QR code (nothing to verify yet).
 *  - E-TICKET — Final travel document. Only generated for CONFIRMED bookings (enforced
 *               here AND in BookingServiceImpl — defense in depth). Includes a QR code
 *               that encodes a live verification URL (never a status snapshot), so
 *               cancelling a booking later instantly invalidates every ticket ever printed.
 */
@Service
public class TicketService {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FMT     = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ── Brand palette — matches the sky-blue TravelNest theme used on the frontend ──
    private static final int[] BRAND_ACCENT = {14, 165, 233};   // sky-500
    private static final int[] TEXT_DARK    = {30, 41, 59};     // slate-800
    private static final int[] TEXT_GRAY    = {100, 116, 139};  // slate-500
    private static final int[] LINE_GRAY    = {203, 213, 225};  // slate-300
    private static final int[] FOOTER_BG    = {240, 249, 255};  // sky-50

    private static final int[] GREEN  = {22, 163, 74};
    private static final int[] RED    = {220, 38, 38};
    private static final int[] AMBER  = {217, 119, 6};

    // ═══════════════════ PUBLIC ENTRY POINTS ═══════════════════

    /** Always available once a booking exists (i.e. payment succeeded) — no QR. */
    public byte[] generateReceiptPdf(Booking booking, String siteName, String supportEmail, String supportPhone) throws Exception {
        return buildPdf(booking, siteName, supportEmail, supportPhone, false);
    }

    /** Only for CONFIRMED bookings — includes the verification QR code. */
    public byte[] generateTicketPdf(Booking booking, String siteName, String supportEmail, String supportPhone) throws Exception {
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            // Defense in depth — BookingServiceImpl should already block this before
            // calling here, but the PDF generator itself must never emit a QR-bearing
            // "E-Ticket" for a booking that isn't actually confirmed.
            throw new IllegalStateException("E-Ticket is only available for confirmed bookings");
        }
        return buildPdf(booking, siteName, supportEmail, supportPhone, true);
    }

    // ═══════════════════ SHARED LAYOUT ═══════════════════

    private byte[] buildPdf(Booking booking, String siteName, String supportEmail, String supportPhone, boolean isFinalTicket) throws Exception {

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float pageWidth  = PDRectangle.A4.getWidth();
            float pageHeight = PDRectangle.A4.getHeight();
            float margin     = 40;

            PDFont fontBold    = PDType1Font.HELVETICA_BOLD;
            PDFont fontRegular = PDType1Font.HELVETICA;

            String bookingRef = "TN" + String.format("%04d", booking.getId());

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {

                // ── Header band ──
                float headerHeight = 95;
                cs.setNonStrokingColor(BRAND_ACCENT[0], BRAND_ACCENT[1], BRAND_ACCENT[2]);
                cs.addRect(0, pageHeight - headerHeight, pageWidth, headerHeight);
                cs.fill();

                cs.setNonStrokingColor(255, 255, 255);
                drawText(cs, fontBold, 22, margin, pageHeight - 42, siteName == null ? "TravelNest" : siteName);
                drawText(cs, fontRegular, 9, margin, pageHeight - 60,
                        isFinalTicket ? "E-Ticket - Confirmed Travel Document" : "Payment Receipt - Booking Acknowledgement");

                String refLabel = "BOOKING REFERENCE";
                String refValue = "#" + bookingRef;
                drawTextRightAligned(cs, fontRegular, 8, pageWidth - margin, pageHeight - 38, refLabel);
                drawTextRightAligned(cs, fontBold, 18, pageWidth - margin, pageHeight - 60, refValue);

                // ── Body start ──
                float y = pageHeight - headerHeight - 35;

                // QR (E-Ticket only) OR status note box (Receipt)
                float boxSize = 90;
                float boxX = pageWidth - margin - boxSize;
                float boxY = y - boxSize + 10;

                if (isFinalTicket) {
                    String verifyUrl = frontendUrl + "/verify/" + booking.getVerificationToken();
                    BufferedImage qrImage = generateQrImage(verifyUrl, 240);
                    PDImageXObject qrPdImage = LosslessFactory.createFromImage(document, qrImage);
                    cs.drawImage(qrPdImage, boxX, boxY, boxSize, boxSize);

                    cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
                    drawTextCenteredIn(cs, fontRegular, 7, boxX, boxSize, boxY - 11, "Scan to verify");
                } else {
                    drawStatusNoteBox(cs, fontBold, fontRegular, boxX, boxY, boxSize, booking);
                }

                // Package title + location (left side)
                cs.setNonStrokingColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
                drawText(cs, fontBold, 16, margin, y, booking.getPackageEntity().getTitle());
                cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
                drawText(cs, fontRegular, 10, margin, y - 18, "Location: " + safe(booking.getPackageEntity().getLocation()));

                y = Math.min(boxY, y - 35) - 25;
                drawDashedLine(cs, margin, y, pageWidth - margin);
                y -= 28;

                // ── Info grid ──
                float col1X = margin;
                float col2X = pageWidth / 2 + 10;

                String tourStart = booking.getPackageEntity().getTourStartDate() != null
                        ? booking.getPackageEntity().getTourStartDate().format(DATE_FMT) : "N/A";
                String tourEnd = booking.getPackageEntity().getTourEndDate() != null
                        ? booking.getPackageEntity().getTourEndDate().format(DATE_FMT) : "N/A";

                y = drawLabelValueRow(cs, fontBold, fontRegular, col1X, col2X, y,
                        "TOUR START", tourStart, "TOUR END", tourEnd);
                y = drawLabelValueRow(cs, fontBold, fontRegular, col1X, col2X, y,
                        "TRAVELERS", booking.getTravelers() + " person(s)",
                        "DURATION", safe(booking.getPackageEntity().getDuration()));
                y = drawLabelValueRow(cs, fontBold, fontRegular, col1X, col2X, y,
                        "BOOKED ON", booking.getCreatedAt().format(DATETIME_FMT),
                        "CATEGORY", safe(booking.getPackageEntity().getCategory()));

                y -= 8;
                drawDashedLine(cs, margin, y, pageWidth - margin);
                y -= 28;

                // ── Passenger details ──
                y = drawLabelValueRow(cs, fontBold, fontRegular, col1X, col2X, y,
                        "PASSENGER", safe(booking.getUser().getName()),
                        "CONTACT", safe(booking.getUser().getPhone()));
                drawLabelValue(cs, fontBold, fontRegular, col1X, y, "EMAIL", safe(booking.getUser().getEmail()));
                y -= 35;

                drawDashedLine(cs, margin, y, pageWidth - margin);
                y -= 28;

                // ── Price breakdown ──
                double base = booking.getPackageEntity().getPrice() * booking.getTravelers();
                double tax  = booking.getTotalAmount() - base;

                y = drawPriceRow(cs, fontRegular, margin, pageWidth - margin, y, "Base Amount", base, false);
                y = drawPriceRow(cs, fontRegular, margin, pageWidth - margin, y, "Taxes & Fees", tax, false);

                cs.setStrokingColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
                cs.setLineWidth(0.7f);
                cs.moveTo(margin, y + 9);
                cs.lineTo(pageWidth - margin, y + 9);
                cs.stroke();

                y = drawPriceRow(cs, fontBold, margin, pageWidth - margin, y, "Total Paid", booking.getTotalAmount(), true);
                y -= 12;

                // ── Status badges ──
                drawStatusBadge(cs, fontBold, margin, y, "BOOKING STATUS: " + readableStatus(booking.getStatus()), booking.getStatus().name());
                drawStatusBadge(cs, fontBold, col2X, y, "PAYMENT: " + booking.getPaymentStatus().name(), booking.getPaymentStatus().name());
                y -= 18;

                if (booking.getAdminNote() != null && !booking.getAdminNote().isBlank()) {
                    cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
                    drawText(cs, fontRegular, 8, margin, y, "Note: " + booking.getAdminNote());
                    y -= 14;
                }

                if (booking.getRazorpayPaymentId() != null) {
                    cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
                    drawText(cs, fontRegular, 8, margin, y, "Razorpay Payment ID: " + booking.getRazorpayPaymentId());
                }

                // ── Footer ──
                float footerHeight = 70;
                cs.setNonStrokingColor(FOOTER_BG[0], FOOTER_BG[1], FOOTER_BG[2]);
                cs.addRect(0, 0, pageWidth, footerHeight);
                cs.fill();

                cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
                drawTextCentered(cs, fontRegular, 8, pageWidth, footerHeight - 18, footerNote(booking, isFinalTicket));
                drawTextCentered(cs, fontRegular, 8, pageWidth, footerHeight - 32,
                        "Support: " + safe(supportEmail) + "   |   " + safe(supportPhone));
                drawTextCentered(cs, fontRegular, 7, pageWidth, footerHeight - 48,
                        isFinalTicket
                                ? "This is a system-generated ticket. Scan the QR code above to verify booking authenticity."
                                : "This receipt is proof of payment, not a travel document.");
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    // ───────────────────────── status text helpers ─────────────────────────

    private String readableStatus(Booking.BookingStatus status) {
        switch (status) {
            case PENDING: return "PENDING - Awaiting Confirmation";
            case CONFIRMED: return "CONFIRMED";
            case CANCEL_REQUESTED: return "CANCELLATION UNDER REVIEW";
            case CANCELLED_BY_USER: return "CANCELLED (by you)";
            case CANCELLED_BY_ADMIN: return "CANCELLED (by operator)";
            default: return status.name();
        }
    }

    private String footerNote(Booking booking, boolean isFinalTicket) {
        if (isFinalTicket) return "This is your confirmed travel document.";
        switch (booking.getStatus()) {
            case PENDING:
                return "Your booking is awaiting confirmation. The E-Ticket with QR code unlocks once approved.";
            case CANCEL_REQUESTED:
                return "Your cancellation request is under review by our team.";
            case CANCELLED_BY_USER:
            case CANCELLED_BY_ADMIN:
                return "This booking has been cancelled. See refund status above.";
            default:
                return "Your booking is awaiting confirmation.";
        }
    }

    private void drawStatusNoteBox(PDPageContentStream cs, PDFont bold, PDFont regular,
                                   float boxX, float boxY, float boxSize, Booking booking) throws Exception {
        cs.setNonStrokingColor(FOOTER_BG[0], FOOTER_BG[1], FOOTER_BG[2]);
        cs.addRect(boxX, boxY, boxSize, boxSize);
        cs.fill();

        String line1;
        String line2;
        switch (booking.getStatus()) {
            case PENDING:
                line1 = "Awaiting";
                line2 = "Confirmation";
                break;
            case CANCEL_REQUESTED:
                line1 = "Cancellation";
                line2 = "Under Review";
                break;
            case CANCELLED_BY_USER:
            case CANCELLED_BY_ADMIN:
                line1 = "Booking";
                line2 = "Cancelled";
                break;
            default:
                line1 = "See E-Ticket";
                line2 = "for QR code";
        }

        cs.setNonStrokingColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
        drawTextCenteredIn(cs, bold, 10, boxX, boxSize, boxY + boxSize / 2 + 4, line1);
        cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
        drawTextCenteredIn(cs, regular, 9, boxX, boxSize, boxY + boxSize / 2 - 10, line2);
    }

    // ───────────────────────── generic drawing helpers ─────────────────────────

    private String safe(String s) {
        return (s == null || s.isBlank()) ? "N/A" : s;
    }

    private String fmtAmount(double amount) {
        return String.format(Locale.US, "%,.0f", amount);
    }

    private void drawText(PDPageContentStream cs, PDFont font, float size, float x, float y, String text) throws Exception {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text == null ? "" : text);
        cs.endText();
    }

    private void drawTextRightAligned(PDPageContentStream cs, PDFont font, float size, float rightX, float y, String text) throws Exception {
        float width = font.getStringWidth(text) / 1000 * size;
        drawText(cs, font, size, rightX - width, y, text);
    }

    private void drawTextCentered(PDPageContentStream cs, PDFont font, float size, float pageWidth, float y, String text) throws Exception {
        float width = font.getStringWidth(text) / 1000 * size;
        drawText(cs, font, size, (pageWidth - width) / 2, y, text);
    }

    private void drawTextCenteredIn(PDPageContentStream cs, PDFont font, float size, float boxX, float boxWidth, float y, String text) throws Exception {
        float width = font.getStringWidth(text) / 1000 * size;
        drawText(cs, font, size, boxX + (boxWidth - width) / 2, y, text);
    }

    private void drawDashedLine(PDPageContentStream cs, float x1, float y, float x2) throws Exception {
        cs.setStrokingColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
        cs.setLineDashPattern(new float[]{3, 3}, 0);
        cs.setLineWidth(1);
        cs.moveTo(x1, y);
        cs.lineTo(x2, y);
        cs.stroke();
        cs.setLineDashPattern(new float[]{}, 0);
    }

    private void drawLabelValue(PDPageContentStream cs, PDFont bold, PDFont regular, float x, float y, String label, String value) throws Exception {
        cs.setNonStrokingColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
        drawText(cs, regular, 8, x, y, label);
        cs.setNonStrokingColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
        drawText(cs, bold, 11, x, y - 14, value == null ? "N/A" : value);
    }

    private float drawLabelValueRow(PDPageContentStream cs, PDFont bold, PDFont regular,
                                    float col1X, float col2X, float y,
                                    String label1, String value1, String label2, String value2) throws Exception {
        drawLabelValue(cs, bold, regular, col1X, y, label1, value1);
        drawLabelValue(cs, bold, regular, col2X, y, label2, value2);
        return y - 35;
    }

    private float drawPriceRow(PDPageContentStream cs, PDFont font, float xLeft, float xRight, float y, String label, double amount, boolean bold) throws Exception {
        int[] color = bold ? TEXT_DARK : TEXT_GRAY;
        cs.setNonStrokingColor(color[0], color[1], color[2]);
        float size = bold ? 13 : 10;
        drawText(cs, font, size, xLeft, y, label);
        String amtStr = "Rs. " + fmtAmount(amount);
        float w = font.getStringWidth(amtStr) / 1000 * size;
        drawText(cs, font, size, xRight - w, y, amtStr);
        return y - (bold ? 22 : 18);
    }

    private void drawStatusBadge(PDPageContentStream cs, PDFont font, float x, float y, String text, String statusKey) throws Exception {
        int[] color;
        switch (statusKey) {
            case "CONFIRMED":
            case "PAID":
                color = GREEN;
                break;
            case "CANCELLED_BY_USER":
            case "CANCELLED_BY_ADMIN":
            case "REFUNDED":
                color = RED;
                break;
            default:
                color = AMBER; // PENDING, CANCEL_REQUESTED
        }
        cs.setNonStrokingColor(color[0], color[1], color[2]);
        drawText(cs, font, 10, x, y, text);
    }

    private BufferedImage generateQrImage(String content, int size) throws WriterException {
        QRCodeWriter writer = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 1);
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, size, size, hints);
        return MatrixToImageWriter.toBufferedImage(matrix);
    }
}