import axios from "@/app/utils/axios";
import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_URL = '/web/v1/product';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json(
      { error: 'product_id is required' },
      { status: 400 },
    );
  }

  try {
    const response = await axios.get(EXTERNAL_API_URL, {
      params: { product_id: productId },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('[API_PRODUCT_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(EXTERNAL_API_URL, body);
    
    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error('[API_PRODUCT_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}


export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await axios.put(EXTERNAL_API_URL, body);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('[API_PRODUCT_PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('product_id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    const response = await axios.delete(`${EXTERNAL_API_URL}/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('[API_PRODUCT_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}