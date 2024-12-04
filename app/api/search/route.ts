import { NextResponse } from "next/server";
import { scrapeDouban } from "@/lib/scrape";

export async function GET(request: Request) {
    try {
        // 从 URL 中获取搜索参数
        const { searchParams } = new URL(request.url);
        const searchText = searchParams.get("q");

        // 验证搜索参数
        if (!searchText) {
            return NextResponse.json(
                { error: "搜索关键词不能为空" },
                { status: 400 }
            );
        }

        // 调用爬虫函数获取结果
        const results = await scrapeDouban(searchText);

        // 返回结果
        return NextResponse.json(results);
    } catch (error: unknown) {
        // 错误处理
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '未知错误' },
            { status: 500 }
        );
    }
}
