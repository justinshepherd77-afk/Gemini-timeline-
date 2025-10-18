import React, { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { QueryBuilder } from './components/QueryBuilder';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AdminPanel } from './components/AdminPanel';
import { 
  getSummaries, getInDepthReport, getTimeline, generateImage, 
  classifySearchTerm, getTopicSummary, getPersonSummary, getPersonInDepth, getFamilyTree, getSixDegreesOfSeparation
} from './services/geminiService';
import type { SearchResult, Query } from './types';
import { useAuth } from './contexts/AuthContext';

const TIER_COSTS = {
  1: 0, // Initial summary is always free
  2: 1, // In-depth report (Full Report)
  3: 2, // Echoes / Timeline
  4: 2, // Family Tree
};

const App: React.FC = () => {
  // State for Time Explorer
  const [century, setCentury] = useState<number>(-4); // Default to 4th Century BCE
  const [year, setYear] = useState<number>(-400);
  const [region, setRegion] = useState<string>('Europe (Southern)');
  const [country, setCountry] = useState<string>('Greece');
  const [city, setCity] = useState<string>('Athens');
  const [topic, setTopic] = useState<string>('Religion & Philosophy');

  // State for Search Mode
  const [searchMode, setSearchMode] = useState<'time' | 'search'>('time');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // General State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  
  const { user, useCredit } = useAuth();

  const timeQuery = useMemo<Query>(() => ({
    year, city, country, topic
  }), [year, city, country, topic]);

  const handleSearch = useCallback(async (tier: 1 | 2 | 3 | 4) => {
    const cost = TIER_COSTS[tier];

    // Gatekeeping for paid tiers
    if (tier > 1) {
      if (user.status === 'guest') {
        setError("Please log in to unlock this feature.");
        return;
      }
      if (user.status === 'pending') {
        setError("Your account is pending approval.");
        return;
      }
      if (user.status === 'approved' && cost > 0 && user.credits < cost) {
        setError(`You need ${cost} credit(s) for this action, but you only have ${user.credits}. You can add more from the user menu.`);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (searchMode === 'time') {
        if (tier === 1) {
          const summaryResults = await getSummaries(timeQuery);
          setResults({
            type: 'time',
            query: timeQuery,
            summary: summaryResults,
            inDepth: null,
            timeline: null,
            imageUrl: null,
          });
        } else if (tier === 2 && results?.type === 'time') {
          const inDepthResult = await getInDepthReport(results.query);
          setResults({ ...results, inDepth: inDepthResult });
        } else if (tier === 3 && results?.type === 'time') {
           const timelineResult = await getTimeline(results.query);
           setResults({ ...results, timeline: timelineResult });
        }
      } else if (searchMode === 'search') {
        if (tier === 1) {
          const type = await classifySearchTerm(searchTerm);
          if (type === 'person') {
            const summary = await getPersonSummary(searchTerm);
            setResults({
              type: 'person',
              query: { searchTerm },
              summary,
              inDepth: null,
              sixDegrees: null,
              familyTree: null,
              imageUrl: null,
            });
          } else {
             const summary = await getTopicSummary(searchTerm);
             setResults({
               type: 'topic',
               query: { searchTerm },
               summary,
               inDepth: null,
               timeline: null,
               imageUrl: null,
             });
          }
        } else if (tier === 2 && results?.type === 'person') {
          const inDepth = await getPersonInDepth(results.query.searchTerm);
          setResults({ ...results, inDepth });
        } else if (tier === 3 && results?.type === 'person') {
          const sixDegrees = await getSixDegreesOfSeparation(results.query.searchTerm);
          setResults({ ...results, sixDegrees });
        } else if (tier === 4 && results?.type === 'person') {
          const familyTree = await getFamilyTree(results.query.searchTerm);
          setResults({ ...results, familyTree: familyTree });
        }
      }

      if (cost > 0 && user.status === 'approved') {
        useCredit(cost);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [searchMode, timeQuery, searchTerm, results, user, useCredit]);

  const handleGenerateImage = useCallback(async () => {
    if (!results || !results.query) return;

    const imageCost = 1;
    if (user.status === 'guest') {
        setError("Please log in to generate images.");
        return;
    }
    if (user.status === 'pending') {
        setError("Your account is pending approval.");
        return;
    }
    if (user.credits < imageCost) {
        setError(`You need ${imageCost} credit to generate an image. You have ${user.credits}.`);
        return;
    }

    setIsGeneratingImage(true);
    setError(null);

    try {
      const imageB64 = await generateImage(results.query);
      setResults(prevResults => prevResults ? { ...prevResults, imageUrl: `data:image/jpeg;base64,${imageB64}` } : null);
      useCredit(imageCost);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the image.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [results, user, useCredit]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <QueryBuilder
              century={century}
              setCentury={setCentury}
              year={year}
              setYear={setYear}
              region={region}
              setRegion={setRegion}
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              topic={topic}
              setTopic={setTopic}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={() => handleSearch(1)}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8">
            {isLoading && !results && <LoadingSpinner />}
            {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4">{error}</div>}
            {results && (
              <ResultsDisplay 
                data={results}
                onGetInDepthReport={() => handleSearch(2)}
                onGetTimeline={() => handleSearch(3)}
                onGetSixDegrees={() => handleSearch(3)}
                onGetFamilyTree={() => handleSearch(4)}
                onGenerateImage={handleGenerateImage}
                isLoading={isLoading}
                isGeneratingImage={isGeneratingImage}
              />
            )}
            {!results && !isLoading && !error && (
               <div className="flex items-center justify-center h-full bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-300">Welcome to Chronolink</h2>
                  <p className="mt-2 text-gray-400">Use the controls on the left to begin your journey through history.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <AdminPanel />
    </div>
  );
};

export default App;