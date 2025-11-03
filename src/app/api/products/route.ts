import axios from "@/app/utils/axios";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const response = await axios.get('/web/v1/products', {
            params: searchParams,
        });

        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}