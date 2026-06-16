import { NextResponse } from "next/server";

// 🟢 Success Response Standard
export function successResponse(data: any = null, message = "Operation successful", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

// 🔴 Error Response Standard
export function errorResponse(message = "An error occurred", status = 500, errors: any = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors, // Detailed validation errors if any
    },
    { status }
  );
}
