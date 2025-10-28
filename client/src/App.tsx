import { useState, useRef, useEffect, type ReactElement } from 'react';

interface ProgressMessage {
  message: string;
  data?: any;
}

function MarkdownRenderer({ content }: { content: string }) {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactElement[] = [];
    let listItems: Array<{ content: string; type: 'action' | 'why' | 'examples' | 'default' }> = [];
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key++} className="list-none p-0 m-0 space-y-5">
            {listItems.map((item, idx) => (
              <li key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:border-purple-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-purple-600 mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const formatText = (text: string) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-purple-700">$1</em>');
    };

    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        flushList();
        const title = line.slice(4);
        elements.push(
          <h3 key={key++} className="text-2xl font-bold text-gray-900 mt-10 mb-5 pb-3 border-b-2 border-purple-300 flex items-center">
            <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
              {elements.filter(el => el.type === 'h3').length + 1}
            </span>
            {title}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        const title = line.slice(3);
        elements.push(
          <h2 key={key++} className="text-3xl font-bold mb-6 mt-12 text-gray-900 border-l-4 border-purple-500 pl-4">
            {title}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        const title = line.slice(2);
        elements.push(
          <h1 key={key++} className="text-4xl font-bold mb-6 mt-8 text-gray-900 pb-4 border-b-4 border-purple-500">
            {title}
          </h1>
        );
      } else if (line.match(/^\d+\.\s+/) || line.match(/^[-*]\s+/)) {
        const item = line.replace(/^\d+\.\s+/, '').replace(/^[-*]\s+/, '');
        const formattedItem = formatText(item);
        
        let type: 'action' | 'why' | 'examples' | 'default' = 'default';
        if (item.toLowerCase().startsWith('action:')) {
          type = 'action';
        } else if (item.toLowerCase().startsWith('why:')) {
          type = 'why';
        } else if (item.toLowerCase().startsWith('examples:') || item.toLowerCase().startsWith('example:')) {
          type = 'examples';
        }
        
        listItems.push({ content: formattedItem, type });
      } else if (line.trim()) {
        flushList();
        const formattedLine = formatText(line);
        
        // Check for special content types
        if (line.toLowerCase().includes('overall assessment:') || line.toLowerCase().includes('overall impression:')) {
          elements.push(
            <div key={key++} className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-5 rounded-lg mb-6 shadow-sm">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📊</span>
                <p className="text-gray-800 leading-relaxed font-medium flex-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </div>
            </div>
          );
        } else if (line.toLowerCase().startsWith('action:') || line.toLowerCase().includes('✅')) {
          elements.push(
            <div key={key++} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4 shadow-sm">
              <div className="flex items-start">
                <span className="text-xl mr-3">✅</span>
                <p className="text-gray-700 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </div>
            </div>
          );
        } else if (line.toLowerCase().startsWith('why:') || line.toLowerCase().includes('💡')) {
          elements.push(
            <div key={key++} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4 shadow-sm">
              <div className="flex items-start">
                <span className="text-xl mr-3">💡</span>
                <p className="text-gray-700 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </div>
            </div>
          );
        } else if (line.toLowerCase().startsWith('example:') || line.toLowerCase().includes('📝')) {
          elements.push(
            <div key={key++} className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-4 shadow-sm">
              <div className="flex items-start">
                <span className="text-xl mr-3">📝</span>
                <p className="text-gray-700 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </div>
            </div>
          );
        } else if (line.toLowerCase().includes('warning:') || line.toLowerCase().includes('⚠️') || line.toLowerCase().includes('issue:')) {
          elements.push(
            <div key={key++} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-4 shadow-sm">
              <div className="flex items-start">
                <span className="text-xl mr-3">⚠️</span>
                <p className="text-gray-700 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </div>
            </div>
          );
        } else if (line.toLowerCase().includes('summary:') || line.toLowerCase().includes('key takeaway:')) {
          elements.push(
            <div key={key++} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-4 shadow-sm">
              <div className="flex items-start">
                <span className="text-xl mr-3">📌</span>
                <p className="text-gray-700 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
              </div>
            </div>
          );
        } else {
          // Regular paragraphs with improved typography
          elements.push(
            <p key={key++} className="text-gray-700 leading-7 mb-5 max-w-prose" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          );
        }
      } else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return <div className="analysis-content">{parseMarkdown(content)}</div>;
}

function App() {
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<ProgressMessage[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const progressEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    progressEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !url) return;

    setIsAnalyzing(true);
    setProgress([]);
    setAnalysis('');
    setShowEmailForm(false);
    setIsUnlocked(false);

    fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, url }),
    })
      .then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
          if (!reader) return;

          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (!data) continue;

                try {
                  const message = JSON.parse(data);

                  if (message.message === '[DONE]') {
                    setIsAnalyzing(false);
                    setShowEmailForm(true);
                    if (message.data?.finalAnalysis) {
                      setAnalysis(message.data.finalAnalysis);
                    }
                    return;
                  }

                  if (message.message === '[ERROR]') {
                    setIsAnalyzing(false);
                    alert('Error: ' + (message.data?.error || 'Unknown error occurred'));
                    return;
                  }

                  setProgress(prev => [...prev, message]);

                  if (message.data?.analysisChunk) {
                    setAnalysis(prev => prev + message.data.analysisChunk);
                  }

                  if (message.data?.finalAnalysis) {
                    setAnalysis(message.data.finalAnalysis);
                  }
                } catch (e) {
                  console.error('Failed to parse SSE message:', e, data);
                }
              }
            }
          }
        };

        readStream();
      })
      .catch(error => {
        console.error('Error:', error);
        setIsAnalyzing(false);
        alert('Connection error: ' + error.message);
      });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsUnlocked(true);
      } else {
        alert('Failed to save email. Please try again.');
      }
    } catch (error) {
      console.error('Error saving email:', error);
      alert('Failed to save email. Please try again.');
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const displayAnalysis = isUnlocked ? analysis : truncateText(analysis, 500);

  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-800 min-h-screen flex flex-col items-center py-12 px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        
        <header className="text-center text-white">
          <h1 className="text-5xl font-bold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            🔍 Opichi Onpage
          </h1>
          <p className="text-xl opacity-90">Discover what's keeping your page from ranking #1</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg">
          <div className="mb-5">
            <label htmlFor="keyword" className="block mb-2 font-semibold text-gray-700">
              Target Keyword
            </label>
            <input
              id="keyword"
              type="text"
              placeholder="e.g., best running shoes"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={isAnalyzing}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="url" className="block mb-2 font-semibold text-gray-700">
              Your Page URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/your-page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 hover:shadow-xl transition-transform duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze My Page'}
          </button>
        </form>

        {progress.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl text-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Analysis Progress</h2>
            <div className="max-h-60 overflow-y-auto bg-gray-100 p-4 rounded-lg">
              {progress.map((msg, idx) => {
                const isComplete = msg.message.toLowerCase().includes('complete') || msg.message.toLowerCase().includes('done');
                return (
                  <div key={idx} className="flex items-start mb-2">
                    <span className={`${isComplete ? 'text-green-600' : 'text-purple-600'} font-bold mr-2`}>
                      {isComplete ? '✓' : '•'}
                    </span>
                    <span className={`${isComplete ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {msg.message}
                    </span>
                  </div>
                );
              })}
              <div ref={progressEndRef} />
            </div>
          </div>
        )}

        {analysis && (
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl w-full max-w-4xl text-gray-800 relative">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">SEO Task Analysis</h2>
            
            <div className={`${!isUnlocked ? 'max-h-96 overflow-hidden relative' : ''}`}>
              <MarkdownRenderer content={displayAnalysis} />
              
              {!isUnlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              )}
            </div>

            {!isUnlocked && showEmailForm && (
              <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-700 p-6 rounded-xl text-white text-center">
                <h3 className="text-2xl font-bold mb-2">🔓 Unlock Full Analysis</h3>
                <p className="mb-4 opacity-90">Enter your email to see the complete actionable checklist</p>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-purple-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Unlock Report
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
