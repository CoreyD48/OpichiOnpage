import { useState, useRef, useEffect } from 'react';
import './App.css';

interface ProgressMessage {
  message: string;
  data?: any;
}

function MarkdownRenderer({ content }: { content: string }) {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key++} className="checklist">
            {listItems.map((item, idx) => (
              <li key={idx} className="checklist-item">
                <span className="checkbox">☐</span>
                <span className="item-text">{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line) => {
      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={key++} className="section-subtitle">{line.slice(4)}</h3>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={key++} className="section-title">{line.slice(3)}</h2>);
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={key++} className="main-title">{line.slice(2)}</h1>);
      }
      // Numbered lists (like "1. Item")
      else if (line.match(/^\d+\.\s+/)) {
        const item = line.replace(/^\d+\.\s+/, '');
        listItems.push(item);
      }
      // Bullet points
      else if (line.match(/^[-*]\s+/)) {
        const item = line.replace(/^[-*]\s+/, '');
        listItems.push(item);
      }
      // Bold text
      else if (line.includes('**')) {
        flushList();
        const parts = line.split('**');
        const formatted = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
        elements.push(<p key={key++} className="text-content">{formatted}</p>);
      }
      // Regular text
      else if (line.trim()) {
        flushList();
        elements.push(<p key={key++} className="text-content">{line}</p>);
      }
      // Empty line
      else {
        flushList();
      }
    });

    flushList(); // Flush any remaining list items

    return elements;
  };

  return <div className="markdown-content">{parseMarkdown(content)}</div>;
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
    <div className="app">
      <div className="container">
        <header>
          <h1>🔍 Opichi Onpage</h1>
          <p className="tagline">Discover what's keeping your page from ranking #1</p>
        </header>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="form-group">
            <label htmlFor="keyword">Target Keyword</label>
            <input
              id="keyword"
              type="text"
              placeholder="e.g., best running shoes"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={isAnalyzing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="url">Your Page URL</label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/your-page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              required
            />
          </div>

          <button type="submit" disabled={isAnalyzing} className="analyze-btn">
            {isAnalyzing ? 'Analyzing...' : 'Analyze My Page'}
          </button>
        </form>

        {progress.length > 0 && (
          <div className="progress-section">
            <h2>Analysis Progress</h2>
            <div className="progress-log">
              {progress.map((msg, idx) => (
                <div key={idx} className="progress-item">
                  <span className="progress-bullet">•</span>
                  <span className="progress-text">{msg.message}</span>
                </div>
              ))}
              <div ref={progressEndRef} />
            </div>
          </div>
        )}

        {analysis && (
          <div className="results-section">
            <h2>SEO Task Analysis</h2>
            <div className={`analysis-content ${!isUnlocked ? 'truncated' : ''}`}>
              <MarkdownRenderer content={displayAnalysis} />
            </div>

            {!isUnlocked && showEmailForm && (
              <div className="email-unlock">
                <div className="unlock-overlay">
                  <h3>🔓 Unlock Full Analysis</h3>
                  <p>Enter your email to see the complete actionable checklist</p>
                  <form onSubmit={handleEmailSubmit} className="email-form">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit">Unlock Report</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
