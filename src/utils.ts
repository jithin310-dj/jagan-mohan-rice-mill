import { jsPDF } from 'jspdf';
import { Order } from './types';

/**
 * Generates and downloads a beautiful, PDF-ready invoice of an order directly to the user's device.
 * Uses jsPDF client-side layout capabilities to build a pristine commercial receipt.
 * @param order The Order object to generate the invoice PDF for.
 */
export function downloadOrderPDF(order: Order): void {
  const generatePDF = (logoImg?: HTMLImageElement) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4 dimensions: 210 x 297 mm
    // Margin: 15mm (usable width: 180mm, boundary x is 15 to 195)
    
    // Brand colors
    const primaryColor = [11, 74, 58];     // #0B4A3A - Dark Green
    const accentOrangeColor = [255, 87, 34]; // #FF5722 - Orange
    const darkTextColor = [15, 23, 42];     // #0F172A - Slate 900
    const lightTextColor = [71, 85, 105];   // #475569 - Slate 600
    const mutedTextColor = [100, 116, 139]; // #64748B - Slate 500
    
    // 1. Draw header background card (White with thin border)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240); // slate 200
    doc.setLineWidth(0.4);
    doc.rect(15, 15, 180, 28, 'FD'); // Filled white with border

    // Bottom thick accent bar (Deep Green)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, 41.5, 180, 1.5, 'F');
    
    let textStartX = 20;
    if (logoImg) {
      try {
        // Draw logo image directly in the header card
        doc.addImage(logoImg, 'JPEG', 18, 18, 22, 22);
        textStartX = 44;
      } catch (err) {
        console.error("Failed to add image to jsPDF:", err);
      }
    }

    // Banner Text - Left side
    if (textStartX === 44) {
      // Styled matching the orange & green brand of Jagan Mohan Rice Mill
      doc.setTextColor(accentOrangeColor[0], accentOrangeColor[1], accentOrangeColor[2]); // #FF5722
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text("JAGAN MOHAN", textStartX, 24);
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // #0B4A3A - Dark Green
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("RICE MILL", textStartX, 29);
    } else {
      doc.setTextColor(accentOrangeColor[0], accentOrangeColor[1], accentOrangeColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text("JAGAN MOHAN RICE MILL", textStartX, 25);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]); // Slate 600
    doc.text("Premium Double-Aged Rice & Millets", textStartX, textStartX === 44 ? 34 : 31);
    doc.setFontSize(7.5);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]); // Slate 500
    doc.text("1st Lane, Cobald Pet, Guntur, Andhra Pradesh - 522002", textStartX, textStartX === 44 ? 38.5 : 36);

    // Banner Text - Right side
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Green
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text("RETAIL INVOICE", 190, 24, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]); // Slate 600
    doc.text(`Ref: ${order.id}`, 190, 30, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 190, 35, { align: 'right' });

    // 2. Billing details section
    let y = 52;
    doc.setDrawColor(226, 232, 240); // slate 200
    doc.setLineWidth(0.3);
    
    // Headers for columns
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text("BILLED TO (CONSIGNEE)", 20, y);
    doc.text("MILL DISPATCH AUTHORITY", 110, y);
    
    // Underline headers
    doc.line(20, y + 2, 95, y + 2);
    doc.line(110, y + 2, 190, y + 2);
    
    y += 8;
    
    // Consignee details
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(order.customerName, 20, y);
    
    // Mill details
    doc.text("Jagan Mohan Rice Mill", 110, y);
    
    y += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(`Phone: ${order.phone}`, 20, y);
    doc.text("1st Lane, Cobald Pet", 110, y);
    
    y += 4.5;
    doc.text(`Email: ${order.email}`, 20, y);
    doc.text("Guntur, Andhra Pradesh – 522002", 110, y);
    
    y += 4.5;
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text("Shipping Address:", 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text("Phone: 08632-230154 / +91 7382299666", 110, y);
    
    y += 4.5;
    doc.text("Email: jaganmohanricemill@gmail.com", 110, y);
    
    // Draw shipping address (wrapped lines)
    const addressLines = doc.splitTextToSize(order.address, 75);
    let addrY = y;
    addressLines.forEach((line: string) => {
      doc.text(line, 20, addrY);
      addrY += 4;
    });
    
    // Re-align vertical cursor
    y = Math.max(addrY + 6, y + 14);
    
    // 3. Product Table Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, y, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text("VARIETY NAME / ITEM DESCRIPTION", 20, y + 5.5);
    doc.text("PACK SIZE", 100, y + 5.5, { align: 'center' });
    doc.text("QTY", 125, y + 5.5, { align: 'center' });
    doc.text("PRICE", 150, y + 5.5, { align: 'right' });
    doc.text("TOTAL", 185, y + 5.5, { align: 'right' });
    
    y += 8;
    
    // 4. Render Items
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    order.items.forEach((item) => {
      const prodName = item.productName;
      const nameLines = doc.splitTextToSize(prodName, 70);
      const itemHeight = Math.max(nameLines.length * 4.5, 7);
      
      // Check page boundaries
      if (y + itemHeight > 270) {
        doc.addPage();
        y = 20;
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text("VARIETY NAME / ITEM DESCRIPTION", 20, y + 5.5);
        doc.text("PACK SIZE", 100, y + 5.5, { align: 'center' });
        doc.text("QTY", 125, y + 5.5, { align: 'center' });
        doc.text("PRICE", 150, y + 5.5, { align: 'right' });
        doc.text("TOTAL", 185, y + 5.5, { align: 'right' });
        y += 8;
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      }
      
      // Draw product name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      let nameY = y + 4.5;
      nameLines.forEach((line: string) => {
        doc.text(line, 20, nameY);
        nameY += 4;
      });
      
      if (item.selectedAge) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
        doc.text(`Ageing: ${item.selectedAge}`, 20, nameY - 1);
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      }
      
      // Pack size, Qty, Price, Total
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const sizeStr = item.size === 0.5 ? "500g" : `${item.size} kg`;
      doc.text(sizeStr, 100, y + 4.5, { align: 'center' });
      doc.text(String(item.quantity), 125, y + 4.5, { align: 'center' });
      doc.text(`INR ${item.pricePerItem}`, 150, y + 4.5, { align: 'right' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(`INR ${item.pricePerItem * item.quantity}`, 185, y + 4.5, { align: 'right' });
      
      y += itemHeight + 2;
      
      // Row bottom border
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y, 195, y);
      y += 2;
    });
    
    // 5. Totals column calculations
    if (y + 40 > 275) {
      doc.addPage();
      y = 20;
    }
    
    const rightColX = 145;
    const valueX = 185;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    
    // Raw Subtotal
    doc.text("Raw Subtotal:", rightColX, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(`INR ${order.subtotal}`, valueX, y, { align: 'right' });
    
    y += 5.5;
    
    // Coupon Discount
    if (order.discount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 163, 74); // green
      doc.text("Coupon Discount:", rightColX, y, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`- INR ${order.discount}`, valueX, y, { align: 'right' });
      y += 5.5;
    }
    
    // Dispatch Fee
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text("Double-Aged Dispatch Fee:", rightColX, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    const feeStr = order.deliveryCharge === 0 ? "FREE" : `INR ${order.deliveryCharge}`;
    doc.text(feeStr, valueX, y, { align: 'right' });
    
    y += 7;
    
    // Grand Total separator & text
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(125, y - 2, 195, y - 2);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("TOTAL INVOICE:", rightColX, y + 2, { align: 'right' });
    doc.text(`INR ${order.total}`, valueX, y + 2, { align: 'right' });
    
    y += 10;
    
    // Customer special instructions if present
    if (order.notes) {
      if (y + 25 > 275) {
        doc.addPage();
        y = 20;
      }
      
      // Draw instruction box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      
      const noteLines = doc.splitTextToSize(`Customer Special Instruction: ${order.notes}`, 170);
      const boxHeight = noteLines.length * 4.5 + 8;
      
      doc.rect(15, y, 180, boxHeight, 'FD');
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("CUSTOMER SPECIAL INSTRUCTION:", 20, y + 5);
      
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      let noteY = y + 10;
      noteLines.forEach((line: string) => {
        const cleanLine = line.replace("Customer Special Instruction: ", "");
        doc.text(cleanLine, 20, noteY);
        noteY += 4;
      });
      
      y += boxHeight + 8;
    } else {
      y += 4;
    }
    
    // Payment status banner
    if (y + 18 > 275) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFillColor(240, 253, 244); // light green
    doc.setDrawColor(220, 252, 231);
    doc.rect(15, y, 180, 12, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 83, 45); // dark green
    const upiSuffix = order.upiTransactionId ? `  |  UPI Txn Ref: ${order.upiTransactionId}` : '';
    doc.text(`Payment Method: ${order.paymentMethod}  |  Payment Status: ${order.paymentStatus}${upiSuffix}`, 20, y + 7.5);
    
    // Persistent footer notes
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for your grain consignment purchase from Guntur's finest double-aged mills.", 105, 280, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} Jagan Mohan Rice Mill & Dispatch Centers. All rights reserved.`, 105, 284, { align: 'center' });
    
    // Auto download on device
    doc.save(`Invoice_${order.id}.pdf`);
  };

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/assets/logo.jpeg';
  img.onload = () => {
    generatePDF(img);
  };
  img.onerror = () => {
    generatePDF();
  };
}

/**
 * Generates a clean, PDF-ready retail invoice of an order using the browser's native print capabilities.
 * Creates a temporary iframe containing a beautifully formatted receipt layout, prints it, and cleans up.
 * @param order The Order object to generate the invoice for.
 */
export function printOrderInvoice(order: Order): void {
  // 1. Create a temporary iframe
  const iframe = document.createElement('iframe');
  
  // Hide the iframe completely
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    console.error('Could not access iframe document for printing');
    return;
  }

  // 2. Format dates beautifully
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // 3. Compose item list rows
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: left; vertical-align: top; color: #1e293b;">
          <strong style="color: #0f172a; font-family: system-ui, -apple-system, sans-serif;">${item.productName}</strong>
          ${
            item.selectedAge
              ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;">Ageing: ${item.selectedAge}</div>`
              : ""
          }
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #334155;">
          ${item.size === 0.5 ? "500g" : `${item.size} kg`} Bag
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #334155;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #334155; font-family: monospace;">
          ₹${item.pricePerItem}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: bold; color: #0f172a; font-family: monospace;">
          ₹${item.pricePerItem * item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  // 4. Construct the full invoice document
  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>JMR Invoice - ${order.id}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        .header {
          border-bottom: 3px solid #0b4a3a;
          padding-bottom: 24px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .logo-section h1 {
          color: #0b4a3a;
          margin: 0 0 4px 0;
          font-size: 28px;
          font-family: Georgia, Cambria, "Times New Roman", Times, serif;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .logo-section p {
          margin: 0;
          font-size: 12px;
          color: #475569;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-meta h2 {
          margin: 0 0 6px 0;
          color: #0b4a3a;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .invoice-meta p {
          margin: 3px 0;
          font-size: 13px;
          color: #334155;
        }
        .invoice-meta strong {
          color: #0f172a;
        }
        .details-grid {
          display: flex;
          margin-bottom: 35px;
          gap: 30px;
        }
        .details-col {
          flex: 1;
        }
        .details-col h3 {
          margin: 0 0 10px 0;
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 1px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          font-weight: 700;
        }
        .details-col p {
          margin: 5px 0;
          font-size: 13px;
          line-height: 1.4;
          color: #334155;
        }
        .details-col strong {
          color: #0f172a;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .table th {
          background-color: #0b4a3a;
          color: #ffffff;
          padding: 10px 10px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
        }
        .table th:nth-child(2), .table th:nth-child(3) {
          text-align: center;
        }
        .table th:nth-child(4), .table th:nth-child(5) {
          text-align: right;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 35px;
        }
        .totals-table {
          width: 320px;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 8px 10px;
          font-size: 13px;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
        }
        .totals-table tr.grand-total td {
          font-size: 18px;
          font-weight: 800;
          color: #0b4a3a;
          border-top: 2px solid #0b4a3a;
          border-bottom: none;
          padding-top: 14px;
        }
        .note-box {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 30px;
          font-size: 12px;
        }
        .note-box strong {
          color: #0b4a3a;
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
        }
        .note-box p {
          margin: 0;
          color: #475569;
          line-height: 1.5;
        }
        .payment-summary {
          margin-top: 35px;
          padding: 16px;
          border-radius: 12px;
          background-color: #f0fdf4;
          border: 1px solid #dcfce7;
          text-align: center;
          font-size: 12px;
          color: #14532d;
        }
        .payment-summary p {
          margin: 4px 0;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #64748b;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="align-items: center;">
          <div class="logo-section-wrapper" style="display: flex; align-items: center; gap: 16px;">
            <img src="/assets/logo.jpeg" style="width: 72px; height: 72px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; padding: 2px;" alt="Logo" />
            <div class="logo-section" style="margin: 0;">
              <h1 style="color: #FF5722; font-family: system-ui, -apple-system, sans-serif; font-size: 26px; font-weight: 900; margin: 0; line-height: 1; text-transform: uppercase;">Jagan Mohan</h1>
              <p style="color: #0b4a3a; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 800; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px; line-height: 1;">Rice Mill</p>
              <p style="font-size: 11px; margin-top: 8px; color: #64748b; text-transform: none; letter-spacing: normal; font-weight: normal; line-height: 1.3;">
                1st Lane, Cobald Pet, Guntur, Andhra Pradesh - 522002
              </p>
            </div>
          </div>
          <div class="invoice-meta">
            <h2>RETAIL INVOICE</h2>
            <p>Invoice ID: <strong style="font-family: monospace; font-size: 14px;">${order.id}</strong></p>
            <p>Date: <strong>${formattedDate}</strong></p>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-col">
            <h3>Billed To (Consignee)</h3>
            <p><strong>${order.customerName}</strong></p>
            <p>Phone: ${order.phone}</p>
            <p>Email: ${order.email}</p>
            <p style="margin-top: 8px; white-space: pre-line;">
              <strong>Shipping Address:</strong><br/>${order.address}
            </p>
          </div>
          <div class="details-col">
            <h3>Mill Dispatch Authority</h3>
            <p><strong>Jagan Mohan Rice Mill</strong></p>
            <p>1st Lane, Cobald Pet</p>
            <p>Guntur, Andhra Pradesh – 522002</p>
            <p>Phone: 08632-230154 / +91 7382299666</p>
            <p>Email: jaganmohanricemill@gmail.com</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 40%;">Variety Name</th>
              <th style="width: 15%; text-align: center;">Pack Weight</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Unit Price</th>
              <th style="width: 20%; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td style="text-align: right;">Raw Subtotal:</td>
              <td style="text-align: right; font-weight: bold; color: #0f172a; font-family: monospace;">₹${order.subtotal}</td>
            </tr>
            ${
              order.discount > 0
                ? `
            <tr style="color: #16a34a;">
              <td style="text-align: right;">Coupon Discount:</td>
              <td style="text-align: right; font-weight: bold; font-family: monospace;">- ₹${order.discount}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="text-align: right;">Double-Aged Dispatch Fee:</td>
              <td style="text-align: right; font-weight: bold; color: #0f172a; font-family: monospace;">
                ${order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
              </td>
            </tr>
            <tr class="grand-total">
              <td style="text-align: right;">Total Invoice:</td>
              <td style="text-align: right; font-family: monospace;">₹${order.total}</td>
            </tr>
          </table>
        </div>

        ${
          order.notes
            ? `
        <div class="note-box">
          <strong>Customer Special Instruction:</strong>
          <p>${order.notes}</p>
        </div>
        `
            : ""
        }

        <div class="payment-summary">
          <p><strong>Payment Method:</strong> ${order.paymentMethod} | <strong>Payment Status:</strong> ${
    order.paymentStatus
  }</p>
          ${
            order.upiTransactionId
              ? `<p style="font-family: monospace; font-size: 11px; margin-top: 4px;">UPI Txn Reference: ${order.upiTransactionId}</p>`
              : ""
          }
        </div>

        <div class="footer">
          <p>Thank you for your grain consignment purchase from Guntur's finest double-aged mills.</p>
          <p>For support, please call +91 7382299666 or email jaganmohanricemill@gmail.com.</p>
          <p>&copy; ${new Date().getFullYear()} Jagan Mohan Rice Mill & Dispatch Centers. All rights reserved.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 300);
          
          // Cleanup iframe after print dialog completes
          window.onafterprint = function() {
            window.frameElement.parentNode.removeChild(window.frameElement);
          };
          
          // Fallback cleanup if onafterprint is unsupported or cancelled
          setTimeout(function() {
            if (window.frameElement && window.frameElement.parentNode) {
              window.frameElement.parentNode.removeChild(window.frameElement);
            }
          }, 60000);
        };
      </script>
    </body>
    </html>
  `;

  doc.open();
  doc.write(invoiceHtml);
  doc.close();
}
