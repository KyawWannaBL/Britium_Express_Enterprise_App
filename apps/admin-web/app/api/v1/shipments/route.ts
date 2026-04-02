import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a service role Supabase client for backend operations
// Note: In production, ensure these use your actual environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extract Data from the Request Payload
    const { 
      sender, 
      receiver, 
      shipmentDetails, 
      merchant_account_id, 
      booking_branch_id 
    } = body;

    // --- STEP 1: Insert Sender Address ---
    const { data: senderAddress, error: senderError } = await supabase
      .from('addresses')
      .insert({
        contact_name: sender.name,
        phone_primary: sender.phone,
        address_line_1: sender.address,
        city: sender.city || 'Yangon',
        country_code: 'MM'
      })
      .select('id')
      .single();

    if (senderError) throw new Error(`Sender Address Error: ${senderError.message}`);

    // --- STEP 2: Insert Receiver Address ---
    const { data: receiverAddress, error: receiverError } = await supabase
      .from('addresses')
      .insert({
        contact_name: receiver.name,
        phone_primary: receiver.phone,
        address_line_1: receiver.address,
        city: receiver.city || 'Yangon',
        country_code: 'MM'
      })
      .select('id')
      .single();

    if (receiverError) throw new Error(`Receiver Address Error: ${receiverError.message}`);

    // --- STEP 3: Generate a Tracking Number ---
    // Example: BEX-20260402-XXXX
    const trackingNo = `BEX-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // --- STEP 4: Insert the Final Shipment ---
    const { data: newShipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        tracking_no: trackingNo,
        merchant_account_id: merchant_account_id,
        booking_branch_id: booking_branch_id,
        sender_address_id: senderAddress.id,
        receiver_address_id: receiverAddress.id,
        current_status: 'booked',
        public_status: 'Booked',
        service_type: shipmentDetails.service_type || 'regular',
        delivery_type: shipmentDetails.delivery_type || 'branch_to_address',
        cod_amount: shipmentDetails.cod_amount || 0,
        total_charge: shipmentDetails.total_charge || 2500,
        is_cod: shipmentDetails.cod_amount > 0
      })
      .select()
      .single();

    if (shipmentError) throw new Error(`Shipment Error: ${shipmentError.message}`);

    // Return the successful response matching SPEC-3 guidelines
    return NextResponse.json({
      status: 'success',
      message: 'Shipment created successfully',
      data: newShipment
    }, { status: 201 });

  } catch (error: any) {
    console.error("API Error:", error.message);
    // Return RFC 9457 problem details format as requested in SPEC-3
    return NextResponse.json({
      type: "https://api.britium.com/problems/validation-error",
      title: "Shipment Creation Failed",
      status: 422,
      detail: error.message
    }, { status: 422 });
  }
}
