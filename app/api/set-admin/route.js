import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "naikviraj301@gmail.com";
    
    console.log(`Setting ${email} as ADMIN...`);
    
    const user = await db.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });

    console.log(`User updated:`, user);

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} is now ADMIN`,
      data: user 
    });
  } catch (error) {
    console.error("Error setting admin:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body.email || "naikviraj301@gmail.com";
    
    console.log(`Setting ${email} as ADMIN...`);
    
    const user = await db.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });

    console.log(`User updated:`, user);

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} is now ADMIN`,
      data: user 
    });
  } catch (error) {
    console.error("Error setting admin:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
