import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_mock_key")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, description, planId, userId, successUrl, cancelUrl } = await req.json()

    // Validation
    if (!amount || !description || !planId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // In production, create real Stripe Checkout session
    // For now, return mock data
    const mockSessionId = `cs_test_${Date.now()}`
    const mockUrl = successUrl || `${req.headers.get('origin')}/payment-success`

    return new Response(
      JSON.stringify({
        session_id: mockSessionId,
        url: mockUrl,
        amount: amount,
        plan_id: planId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})