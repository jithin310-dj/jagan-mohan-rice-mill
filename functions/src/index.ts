import { onRequest, CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Interface for typed input parameters (matching Order schema)
interface OrderItem {
  productId: string;
  productName: string;
  size: number;
  quantity: number;
  pricePerItem: number;
}

interface OrderPayload {
  order: {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    total: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
  };
}

/**
 * Cloud Function to handle automated confirmation email delivery after order placement.
 * Uses Firebase Functions v2 Callable pattern.
 */
export const sendOrderConfirmationEmail = onRequest(
  { cors: true }, // Allow cross-origin requests from the client-side SPA
  async (request, response) => {
    // Enable CORS preflight response
    if (request.method === "OPTIONS") {
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "POST");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.set("Access-Control-Max-Age", "3600");
      response.status(204).send("");
      return;
    }

    // Set CORS headers for the main request
    response.set("Access-Control-Allow-Origin", "*");

    try {
      // Parse the order payload from the request body
      // Supporting both standard HTTP POST and callable-style requests
      const data = request.body.data || request.body;
      const orderPayload = data as OrderPayload;

      if (!orderPayload || !orderPayload.order) {
        response.status(400).json({
          error: "Invalid request. Missing order object in the payload."
        });
        return;
      }

      const { order } = orderPayload;

      // Ensure critical parameters are present
      if (!order.id || !order.email || !order.customerName) {
        response.status(400).json({
          error: "Invalid order details. Missing id, email, or customerName."
        });
        return;
      }

      console.log(`Processing order confirmation email for Order ID: ${order.id} to ${order.email}`);

      // Compose the HTML email template
      const itemsHtml = order.items
        .map(
          (item) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333;">
              <strong>${item.productName}</strong>
              <div style="font-size: 11px; color: #888888; margin-top: 2px;">
                Size: ${item.size === 0.5 ? "500gms" : `${item.size}kg`} Bag
              </div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; text-align: right; font-weight: bold;">
              ₹${item.pricePerItem}
            </td>
          </tr>
        `
        )
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - Jagan Mohan Rice Mill</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; margin: 0; padding: 0; background-color: #f6f9f6; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f6f9f6; padding-bottom: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 40px; border: 1px solid #e1ebe2; box-shadow: 0 4px 12px rgba(11, 74, 58, 0.03); }
            .header { background-color: #0b4a3a; padding: 32px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
            .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 32px 24px; }
            .intro { margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #444444; }
            .details-box { background-color: #fbfcfb; border: 1px solid #e8f0e9; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .details-grid { display: table; width: 100%; }
            .details-row { display: table-row; }
            .details-cell { display: table-cell; padding-bottom: 10px; font-size: 13px; color: #555555; }
            .details-cell strong { color: #111111; }
            .table-container { margin-bottom: 24px; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; }
            .items-table { width: 100%; border-collapse: collapse; }
            .totals-table { width: 100%; border-collapse: collapse; background-color: #fbfcfb; border-top: 2px solid #e8f0e9; }
            .totals-row td { padding: 10px 12px; font-size: 13px; color: #555555; }
            .totals-row.grand-total td { font-size: 16px; font-weight: bold; color: #0b4a3a; padding-top: 14px; border-top: 1px dashed #e8f0e9; }
            .footer { background-color: #f6f9f6; padding: 24px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #e1ebe2; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>Jagan Mohan Rice Mill</h1>
                <p>High-Purity Premium Double-Aged Grains</p>
              </div>
              <div class="content">
                <div class="intro">
                  <p>Dear <strong>${order.customerName}</strong>,</p>
                  <p>Thank you for shopping with us! Your order <strong>${order.id}</strong> has been successfully placed in our mill dispatch queue. Our packaging lines are already preparing your premium grains.</p>
                </div>

                <div class="details-box">
                  <div style="font-weight: bold; font-size: 14px; color: #0b4a3a; border-bottom: 1px solid #e8f0e9; padding-bottom: 8px; margin-bottom: 12px;">
                    Consignment Delivery Details
                  </div>
                  <div class="details-grid">
                    <div class="details-row">
                      <div class="details-cell" style="width: 50%;"><strong>Ref:</strong> ${order.id}</div>
                      <div class="details-cell" style="width: 50%;"><strong>Placed On:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div class="details-row">
                      <div class="details-cell"><strong>Phone:</strong> ${order.phone}</div>
                      <div class="details-cell"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
                    </div>
                    <div class="details-row">
                      <div class="details-cell" colspan="2" style="padding-bottom: 0;">
                        <strong>Shipping Destination:</strong><br/>
                        <span style="display: block; margin-top: 4px; line-height: 1.4; color: #222222;">${order.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="table-container">
                  <table class="items-table">
                    <thead>
                      <tr style="background-color: #f6f9f6;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; color: #0b4a3a; text-transform: uppercase; letter-spacing: 0.5px;">Variety Name</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; color: #0b4a3a; text-transform: uppercase; letter-spacing: 0.5px; width: 60px;">Qty</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; color: #0b4a3a; text-transform: uppercase; letter-spacing: 0.5px; width: 100px;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                  <table class="totals-table">
                    <tr class="totals-row">
                      <td style="width: 70%; text-align: right;">Raw Subtotal:</td>
                      <td style="width: 30%; text-align: right; font-weight: bold; color: #333333;">₹${order.subtotal}</td>
                    </tr>
                    ${
                      order.discount > 0
                        ? `
                    <tr class="totals-row" style="color: #2e7d32;">
                      <td style="text-align: right;">Coupon Discount:</td>
                      <td style="text-align: right; font-weight: bold;">- ₹${order.discount}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr class="totals-row">
                      <td style="text-align: right;">Double-Aged Dispatch Fee:</td>
                      <td style="text-align: right; font-weight: bold; color: #333333;">
                        ${order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
                      </td>
                    </tr>
                    <tr class="totals-row grand-total">
                      <td style="text-align: right;">Invoice Total:</td>
                      <td style="text-align: right; font-size: 18px; color: #0b4a3a;">₹${order.total}</td>
                    </tr>
                  </table>
                </div>

                ${
                  order.notes
                    ? `
                <div style="background-color: #fffde7; border: 1px solid #fff59d; border-radius: 8px; padding: 12px; margin-bottom: 24px; font-size: 13px; color: #5d4037;">
                  <strong>Customer Packaging Note:</strong> ${order.notes}
                </div>
                `
                    : ""
                }

                <p style="font-size: 13px; color: #666666; line-height: 1.5; margin-top: 32px; text-align: center;">
                  Should you have any inquiries, please contact our helpline at <strong>+91 7382299666</strong> or reply directly to this email.
                </p>
              </div>
              <div class="footer">
                <p><strong>Jagan Mohan Rice Mill & Dispatch Centers</strong></p>
                <p>Guntur Delta, Andhra Pradesh, India</p>
                <p>&copy; ${new Date().getFullYear()} Jagan Mohan Rice Mill. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Read SMTP Server credentials from Firebase environment/secrets if set,
      // otherwise fall back to a mock/sandbox configuration
      const smtpHost = process.env.SMTP_HOST || "";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";
      const emailSender = process.env.EMAIL_SENDER || '"Jagan Mohan Rice Mill" <noreply@jaganmohanricemill.com>';

      if (smtpHost && smtpUser && smtpPass) {
        // Real mail delivery using configured SMTP credentials
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: emailSender,
          to: order.email,
          subject: `Order Placed Successfully! Ref: ${order.id} - Jagan Mohan Rice Mill`,
          html: emailHtml
        });

        console.log(`Successfully dispatched receipt email to ${order.email} via SMTP.`);
        response.json({
          data: {
            success: true,
            message: `Order confirmation email dispatched successfully to ${order.email}.`
          }
        });
      } else {
        // Sandbox environment fallback - Log full details to the Firebase console
        console.warn(
          "SMTP credentials are not configured in environment variables. Simulating mail delivery in Sandbox mode."
        );
        console.log(`----------------[SIMULATED EMAIL START]----------------`);
        console.log(`To: ${order.email}`);
        console.log(`Subject: Order Placed Successfully! Ref: ${order.id}`);
        console.log(`Body Sample (Intro): Dear ${order.customerName}, your invoice total is ₹${order.total}.`);
        console.log(`-----------------[SIMULATED EMAIL END]-----------------`);

        response.json({
          data: {
            success: true,
            isSandbox: true,
            message: `[Sandbox Mode] Email delivery simulated successfully to ${order.email}. SMTP credentials are required for live delivery.`
          }
        });
      }
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      response.status(500).json({
        error: "Failed to process order confirmation email",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
);
