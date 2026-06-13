import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from 'npm:nodemailer@6.9.10'

const GMAIL_USER = Deno.env.get('GMAIL_USER')
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const payload = await req.json()
    console.log('Received database webhook payload:', JSON.stringify(payload, null, 2))

    // Parse user record from Supabase webhook payload
    const record = payload.record || payload
    const email = record.email
    const fullName = record.raw_user_meta_data?.full_name || 'there'

    if (!email) {
      return new Response(JSON.stringify({ error: 'No email found in payload record' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials are not configured in environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Configure Nodemailer transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    })

    // Send Welcome Email
    await transporter.sendMail({
      from: `"TapeItOut Onboarding" <${GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to TapeItOut!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; background: #0F172A; color: #FFFFFF;">
          <div style="margin-bottom: 24px;">
            <span style="font-weight: bold; font-size: 20px; color: #D4AF37; letter-spacing: 0.05em;">TAPEITOUT</span>
          </div>
          <h2 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Welcome to the Workspace, ${fullName}!</h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            We're excited to have you onboard. TapeItOut is built to give you premium visual control over your ASIC routing flows, helping you track clock trees, timing slack, power density, and DRC violations effortlessly.
          </p>
          <div style="margin-bottom: 32px;">
            <a href="https://ask.tapeitout.com/atlas" style="background-color: #D4AF37; color: #0F172A; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 14px;">
              Enter Workspace
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;" />
          <p style="color: rgba(255,255,255,0.35); font-size: 12px; line-height: 1.4;">
            You received this email because you signed up for an account on ask.tapeitout.com. If you did not create this account, please ignore this email.
          </p>
        </div>
      `,
    })

    console.log('Email sent successfully to:', email)
    return new Response(JSON.stringify({ success: true, message: 'Welcome email sent' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('Edge Function crash:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})

