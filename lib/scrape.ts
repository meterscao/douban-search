import axios from "axios";
import * as cheerio from "cheerio";

// 定义返回数据的接口
interface DoubanSearchResult {
    title: string;
    link: string;
    rating?: string;
    ratingPeople?: string;
    info: string;
    intro: string;
}

// 导出主函数，并接受搜索关键词作为参数
export async function scrapeDouban(searchQuery: string): Promise<DoubanSearchResult[]> {
    const config = {
        url: "https://www.douban.com/search",
        params: {
            cat: "1001",
            q: searchQuery,
        },
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Referer": "https://www.douban.com",
            "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
        },
        timeout: 5000, // 设置超时时间
        validateStatus: (status: number) => status < 500, // 允许任何小于500的状态码
    };

    try {
        const response = await axios(config);

        // 检查响应状态
        if (response.status !== 200) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }

        // 检查响应数据
        if (!response.data) {
            throw new Error('未收到响应数据');
        }

        const $ = cheerio.load(response.data);
        const results: DoubanSearchResult[] = [];

        // 检查是否被封禁
        if ($('title').text().includes('验证')) {
            throw new Error('访问被限制，需要验证码');
        }

        $(".result").each((index, element) => {
            try {
                const title = $(element)
                    .find(".title h3")
                    .text()
                    .replace(/\[.*?\]\s*/, "")
                    .trim();
                const link = $(element).find(".title h3 a").attr("href") || "";
                const rating = $(element).find(".rating_nums").text().trim();
                const ratingPeople = $(element)
                    .find(".rating-info span:contains('人评价')")
                    .text()
                    .trim();
                const info = $(element).find(".subject-cast").text().trim();
                const intro = $(element).find(".content p").text().trim();

                if (title && link) {  // 只添加有效的结果
                    results.push({
                        title,
                        link,
                        ...(rating && { rating }),
                        ...(ratingPeople && { ratingPeople }),
                        info,
                        intro,
                    });
                }
            } catch (err) {
                console.error('解析单个结果时出错:', err);
                // 继续处理下一个结果
            }
        });

        if (results.length === 0) {
            throw new Error('未找到相关结果');
        }
        return results;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('请求超时，请稍后重试');
            }
            if (error.response) {
                throw new Error(`请求失败: ${error.response.status}`);
            }
        }
        if (error instanceof Error) {
            throw new Error(`爬取失败: ${error.message}`);
        }
        throw new Error('爬取失败: 未知错误');
    }
}
