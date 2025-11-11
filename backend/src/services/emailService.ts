import { Resend } from 'resend';
import { logger } from '../utils/logger.js';

// Inicializar Resend con API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email del remitente (debe estar verificado en Resend)
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Enviar email de confirmación de pago al cliente
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  data: {
    clientName: string;
    amount: number;
    currency: string;
    category: string;
    consultationSummary: string;
    paymentId: string;
  }
) {
  try {
    logger.info('Sending payment confirmation email', { to, paymentId: data.paymentId });

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '✅ Pago Confirmado - Consulta Legal Recibida',
      html: getPaymentConfirmationTemplate(data),
    });

    if (error) {
      logger.error('Error sending payment confirmation email', { error, to });
      throw error;
    }

    logger.info('Payment confirmation email sent successfully', { to, emailId: result?.id });
    return result;
  } catch (error) {
    logger.error('Failed to send payment confirmation email', { error, to });
    throw error;
  }
}

/**
 * Enviar notificación al abogado sobre nueva consulta pagada
 */
export async function sendLawyerNotificationEmail(
  data: {
    clientName: string;
    clientEmail: string;
    amount: number;
    category: string;
    consultationSummary: string;
    paymentId: string;
  }
) {
  const LAWYER_EMAIL = process.env.LAWYER_EMAIL || 'abogados.bgarcia@gmail.com';

  try {
    logger.info('Sending lawyer notification email', { paymentId: data.paymentId });

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [LAWYER_EMAIL],
      subject: `🔔 Nueva Consulta Pagada - ${data.category}`,
      html: getLawyerNotificationTemplate(data),
    });

    if (error) {
      logger.error('Error sending lawyer notification email', { error });
      throw error;
    }

    logger.info('Lawyer notification email sent successfully', { emailId: result?.id });
    return result;
  } catch (error) {
    logger.error('Failed to send lawyer notification email', { error });
    throw error;
  }
}

/**
 * Enviar email de fallo de pago
 */
export async function sendPaymentFailedEmail(
  to: string,
  data: {
    clientName: string;
    amount: number;
    errorMessage?: string;
  }
) {
  try {
    logger.info('Sending payment failed email', { to });

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '❌ Problema con tu Pago - Consulta Legal',
      html: getPaymentFailedTemplate(data),
    });

    if (error) {
      logger.error('Error sending payment failed email', { error, to });
      throw error;
    }

    logger.info('Payment failed email sent successfully', { to, emailId: result?.id });
    return result;
  } catch (error) {
    logger.error('Failed to send payment failed email', { error, to });
    throw error;
  }
}

/**
 * Enviar email de reembolso confirmado
 */
export async function sendRefundConfirmationEmail(
  to: string,
  data: {
    clientName: string;
    amount: number;
    currency: string;
    refundReason?: string;
  }
) {
  try {
    logger.info('Sending refund confirmation email', { to });

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '💰 Reembolso Procesado - Consulta Legal',
      html: getRefundConfirmationTemplate(data),
    });

    if (error) {
      logger.error('Error sending refund confirmation email', { error, to });
      throw error;
    }

    logger.info('Refund confirmation email sent successfully', { to, emailId: result?.id });
    return result;
  } catch (error) {
    logger.error('Failed to send refund confirmation email', { error, to });
    throw error;
  }
}

// ============================================================================
// EMAIL TEMPLATES (HTML)
// ============================================================================

function getPaymentConfirmationTemplate(data: {
  clientName: string;
  amount: number;
  currency: string;
  category: string;
  consultationSummary: string;
  paymentId: string;
}): string {
  const currencySymbol = data.currency === 'usd' ? '$' : '€';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0369a1 0%, #d946ef 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✅ ¡Pago Confirmado!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola <strong>${data.clientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Tu pago ha sido procesado exitosamente. Hemos recibido tu consulta legal y nuestros abogados especializados la están revisando.
              </p>
            </td>
          </tr>
          
          <!-- Payment Details -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px;">
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                    <strong>Categoría:</strong>
                  </td>
                  <td style="color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">
                    ${data.category}
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                    <strong>Monto pagado:</strong>
                  </td>
                  <td style="color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">
                    ${currencySymbol}${data.amount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">
                    <strong>ID de Transacción:</strong>
                  </td>
                  <td style="color: #333333; font-size: 14px; text-align: right; font-family: monospace;">
                    ${data.paymentId.substring(0, 20)}...
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Consultation Summary -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 18px;">Tu Consulta:</h3>
              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6; background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #d946ef;">
                ${data.consultationSummary}
              </p>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 18px;">Próximos Pasos:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                <li>Nuestros abogados revisarán tu consulta en las próximas <strong>24-48 horas</strong></li>
                <li>Recibirás una respuesta detallada por email</li>
                <li>Si necesitas más información, no dudes en contactarnos</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                ¿Tienes preguntas? Contáctanos en:
              </p>
              <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: bold;">
                abogados.bgarcia@gmail.com
              </p>
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">
                © 2025 Barbara & Abogados. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getLawyerNotificationTemplate(data: {
  clientName: string;
  clientEmail: string;
  amount: number;
  category: string;
  consultationSummary: string;
  paymentId: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consulta Pagada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #0369a1 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔔 Nueva Consulta Pagada</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">Detalles del Cliente:</h2>
              
              <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                    <strong>Nombre:</strong>
                  </td>
                  <td style="color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">
                    ${data.clientName}
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                    <strong>Email:</strong>
                  </td>
                  <td style="color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">
                    <a href="mailto:${data.clientEmail}" style="color: #0369a1; text-decoration: none;">${data.clientEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                    <strong>Categoría:</strong>
                  </td>
                  <td style="color: #333333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">
                    ${data.category}
                  </td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;">
                    <strong>Monto:</strong>
                  </td>
                  <td style="color: #10b981; font-size: 16px; text-align: right; font-weight: bold;">
                    $${data.amount.toFixed(2)}
                  </td>
                </tr>
              </table>
              
              <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 18px;">Consulta del Cliente:</h3>
              <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                  ${data.consultationSummary}
                </p>
              </div>
              
              <p style="margin: 24px 0 0 0; color: #666666; font-size: 12px;">
                <strong>ID de Pago:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px;">${data.paymentId}</code>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                Revisa la consulta y responde al cliente en las próximas 24-48 horas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getPaymentFailedTemplate(data: {
  clientName: string;
  amount: number;
  errorMessage?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Problema con tu Pago</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">❌ Problema con tu Pago</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola <strong>${data.clientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Lamentablemente, tu pago de <strong>$${data.amount.toFixed(2)}</strong> no pudo ser procesado.
              </p>
              
              ${data.errorMessage ? `
              <div style="background-color: #fee2e2; padding: 16px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>Motivo:</strong> ${data.errorMessage}
                </p>
              </div>
              ` : ''}
              
              <h3 style="margin: 24px 0 12px 0; color: #0369a1; font-size: 18px;">¿Qué puedes hacer?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                <li>Verifica que tu tarjeta tenga fondos suficientes</li>
                <li>Comprueba que los datos de la tarjeta sean correctos</li>
                <li>Intenta usar otro método de pago</li>
                <li>Contacta con tu banco si el problema persiste</li>
              </ul>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://back-jqdv9.ondigitalocean.app/barbweb2/checkout" style="display: inline-block; background-color: #0369a1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Intentar de Nuevo
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                ¿Necesitas ayuda? Contáctanos:
              </p>
              <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: bold;">
                abogados.bgarcia@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getRefundConfirmationTemplate(data: {
  clientName: string;
  amount: number;
  currency: string;
  refundReason?: string;
}): string {
  const currencySymbol = data.currency === 'usd' ? '$' : '€';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reembolso Procesado</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">💰 Reembolso Procesado</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola <strong>${data.clientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Tu reembolso ha sido procesado exitosamente. El dinero aparecerá en tu cuenta en los próximos 5-10 días hábiles.
              </p>
              
              <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: bold;">
                  Monto Reembolsado:
                </p>
                <p style="margin: 0; color: #065f46; font-size: 32px; font-weight: bold;">
                  ${currencySymbol}${data.amount.toFixed(2)}
                </p>
              </div>
              
              ${data.refundReason ? `
              <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
                <p style="margin: 0; color: #555555; font-size: 14px;">
                  <strong>Motivo del reembolso:</strong> ${data.refundReason}
                </p>
              </div>
              ` : ''}
              
              <h3 style="margin: 24px 0 12px 0; color: #0369a1; font-size: 18px;">Información Importante:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                <li>El reembolso se procesará a la misma tarjeta/cuenta usada para el pago</li>
                <li>Puede tardar 5-10 días hábiles en aparecer en tu extracto</li>
                <li>Recibirás una notificación de tu banco cuando se complete</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                ¿Tienes preguntas sobre tu reembolso?
              </p>
              <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: bold;">
                abogados.bgarcia@gmail.com
              </p>
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">
                © 2025 Barbara & Abogados. Gracias por tu confianza.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
