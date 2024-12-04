'use client';
import { useState } from "react";

interface SearchResult {
  title: string;
  link: string;
  rating?: string;
  ratingPeople?: string;
  info: string;
  intro: string;
}

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchText)}`);
      const data = await response.json();

      // 调试输出
      console.log('API返回数据:', data);

      // 类型检查和验证
      if (data && Array.isArray(data)) {
        setResults(data);
      } else if (data && data.error) {
        setError(data.error);
      } else {
        setError('搜索结果格式错误');
      }
    } catch (error) {
      console.error('搜索出错:', error);
      setError('搜索过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        {/* 搜索区域 */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="输入要搜索的书名..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {/* 结果展示区域 */}
        <div className="space-y-6">
          {Array.isArray(results) && results.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-2">
                <a href={result.link} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">
                  {result.title}
                </a>
              </h2>
              {result.rating && (
                <p className="text-sm text-gray-600 mb-2">
                  评分: {result.rating} {result.ratingPeople && `(${result.ratingPeople})`}
                </p>
              )}
              <p className="text-sm text-gray-700 mb-2">{result.info}</p>
              <p className="text-gray-600">{result.intro}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
