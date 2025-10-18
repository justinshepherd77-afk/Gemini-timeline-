import React from 'react';
import type { SearchResult, FamilyTreeNode, HistoricalEchoLink } from '../types';
import { Timeline } from './Timeline';
import { useAuth } from '../contexts/AuthContext';

interface ResultsDisplayProps {
  data: SearchResult;
  onGetInDepthReport: () => void;
  onGetTimeline: () => void;
  onGetSixDegrees: () => void;
  onGetFamilyTree: () => void;
  onGenerateImage: () => void;
  isLoading: boolean;
  isGeneratingImage: boolean;
}

const ResultCard: React.FC<{ title: string; children: React.ReactNode, titleColor?: string }> = ({ title, children, titleColor = 'text-cyan-300' }) => (
  <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 mb-6 shadow-lg">
    <h3 className={`text-2xl font-bold mb-4 border-b border-gray-600 pb-2 ${titleColor}`}>{title}</h3>
    <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 prose-h4:text-cyan-200 max-w-none whitespace-pre-wrap">{children}</div>
  </div>
);

const FamilyTreeNodeComponent: React.FC<{ node: FamilyTreeNode }> = ({ node }) => {
  return (
    <li className="mt-2">
       <div className="flex items-center">
        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 flex-shrink-0"></div>
        <span className="font-bold text-gray-100">{node.name}</span>
        <span className="text-gray-400 italic ml-2"> ({node.relation})</span>
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="pl-5 mt-1 border-l-2 border-gray-700 ml-1">
          {node.children.map((child, index) => (
            <FamilyTreeNodeComponent key={index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

const FamilyTree: React.FC<{ root: FamilyTreeNode }> = ({ root }) => {
  return (
    <ul className="list-none p-0">
      <FamilyTreeNodeComponent node={root} />
    </ul>
  );
};

const SixDegreesDisplay: React.FC<{ links: HistoricalEchoLink[] }> = ({ links }) => {
  return (
    <div className="relative border-l-2 border-gray-600 ml-4 py-4">
      {links.map((link, index) => (
        <div key={index} className="mb-8 ml-8 relative">
          <div className={`absolute -left-[39px] mt-2.5 w-4 h-4 rounded-full border-2 ${index === 0 ? 'border-cyan-400 bg-cyan-400' : index === links.length - 1 ? 'border-purple-400 bg-purple-400' : 'border-gray-400 bg-gray-400'}`}></div>
          <time className="text-sm font-semibold leading-none text-gray-400">
            {link.year}
          </time>
          <h4 className="text-lg font-bold text-gray-100 mt-1">{link.title}</h4>
          <p className="mt-2 text-sm text-gray-300">
            {link.consequence}
          </p>
        </div>
      ))}
    </div>
  );
};

const GatedButton: React.FC<{
  cost: number;
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  loadingText: string;
  actionText: string;
  className: string;
}> = ({ cost, onClick, isLoading, disabled, loadingText, actionText, className }) => {
  const { user, login, addCredits } = useAuth();
  
  if (user.status === 'guest') {
    return (
      <button onClick={login} className={`w-full mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105`}>
        Login to Unlock
      </button>
    );
  }

  if (user.status === 'pending') {
    return (
      <button disabled className="w-full mt-2 bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-3 px-4 rounded-lg">
        Awaiting Approval
      </button>
    );
  }
  
  if (user.status === 'approved' && user.credits < cost) {
    return (
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <p className="text-red-400 mb-2">Requires {cost} credit(s). You have {user.credits}.</p>
        <button onClick={addCredits} className={`w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105`}>
          Add Credits (Get 100)
        </button>
      </div>
    );
  }

  return (
    <button onClick={onClick} disabled={isLoading || disabled} className={`w-full mt-2 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 ${className}`}>
      {isLoading ? loadingText : `${actionText} (${cost} Credit${cost > 1 ? 's' : ''})`}
    </button>
  );
};

const TimeResults: React.FC<Omit<ResultsDisplayProps, 'data' | 'onGetSixDegrees' | 'onGetFamilyTree'> & { data: Extract<SearchResult, { type: 'time' }> }> = 
  ({ data, onGetInDepthReport, onGetTimeline, onGenerateImage, isLoading, isGeneratingImage }) => {
  const { query, summary, inDepth, timeline, imageUrl } = data;

  return (
    <>
      {summary && (
        <>
          <ResultCard title={`Primary Summary: ${query.topic} in ${query.city}, ${query.year}`}>
            {isGeneratingImage && (
                <div className="flex justify-center items-center h-64 bg-gray-700/50 rounded-lg mb-4">
                    <div className="animate-pulse text-gray-400">Conjuring visual history...</div>
                </div>
            )}
            {imageUrl && !isGeneratingImage && (
                <img src={imageUrl} alt={`Representation of ${query.topic} in ${query.city}, ${query.year}`} className="rounded-lg mb-4 w-full h-auto object-cover shadow-lg" />
            )}
            <p>{summary.primary}</p>
            {!imageUrl && !isGeneratingImage && (
                 <GatedButton
                    cost={1}
                    onClick={onGenerateImage}
                    isLoading={isGeneratingImage}
                    disabled={false}
                    loadingText="Generating..."
                    actionText="Generate Image"
                    className="bg-teal-600 hover:bg-teal-500"
                  />
            )}
            {isGeneratingImage && <button disabled className="w-full mt-4 bg-teal-800 cursor-not-allowed text-gray-400 font-bold py-2 px-4 rounded-lg">Generating...</button>}
          </ResultCard>

          <ResultCard title="Related Historical Echo" titleColor="text-teal-300">
            <p>{summary.related}</p>
          </ResultCard>
        </>
      )}

      {summary && !inDepth && (
        <GatedButton cost={1} onClick={onGetInDepthReport} isLoading={isLoading} disabled={isGeneratingImage} loadingText="Generating..." actionText="Get In-Depth Report" className="bg-purple-600 hover:bg-purple-500" />
      )}

      {inDepth && (() => {
          const sections = [
              { title: 'Key Figures', content: inDepth.keyFigures },
              { title: 'Socio-Political Context', content: inDepth.socioPoliticalContext },
              { title: 'Opposing Views', content: inDepth.opposingViews },
              { title: 'Immediate Consequences', content: inDepth.immediateConsequences },
          ].filter(s => s.content && s.content.trim() !== '');

          return (
              <ResultCard title="In-Depth Report" titleColor="text-purple-300">
                  {sections.map((section, index) => (
                      <div key={section.title} className={index < sections.length - 1 ? 'mb-4 pb-4 border-b border-gray-700' : ''}>
                          <h4 className="font-bold text-lg mb-2">{section.title}</h4>
                          <p>{section.content}</p>
                      </div>
                  ))}
              </ResultCard>
          );
      })()}

      {inDepth && !timeline && (
        <GatedButton cost={2} onClick={onGetTimeline} isLoading={isLoading} disabled={isGeneratingImage} loadingText="Generating..." actionText="Generate Echo Through Time" className="bg-amber-600 hover:bg-amber-500" />
      )}

      {timeline && (
        <ResultCard title="Echo Through Time: A Timeline" titleColor="text-amber-300">
          <Timeline events={timeline} />
        </ResultCard>
      )}
    </>
  );
};

const PersonResults: React.FC<Omit<ResultsDisplayProps, 'data' | 'onGetTimeline'> & { data: Extract<SearchResult, { type: 'person' }> }> = 
  ({ data, onGetInDepthReport, onGetSixDegrees, onGetFamilyTree, isLoading, isGeneratingImage }) => {
  const { query, summary, inDepth, sixDegrees, familyTree } = data;

  return (
    <>
      {summary && (
        <ResultCard title={`Overview of ${query.searchTerm}`}>
          <h4 className="font-bold text-lg mb-2">Overview</h4>
          <p className="mb-4">{summary.overview}</p>
          <h4 className="font-bold text-lg mb-2">Immediate Family</h4>
          <p className="mb-4">{summary.family}</p>
          <h4 className="font-bold text-lg mb-2">Key Life Events</h4>
          <p>{summary.keyEvents}</p>
        </ResultCard>
      )}

      {summary && !inDepth && (
        <GatedButton cost={1} onClick={onGetInDepthReport} isLoading={isLoading} disabled={isGeneratingImage} loadingText="Researching..." actionText="Get In-Depth Report" className="bg-purple-600 hover:bg-purple-500" />
      )}

      {inDepth && (() => {
          const sections = [
              { title: 'Contextual Analysis & Influence', content: inDepth.contextualAnalysis },
              { title: 'Friends & Associates', content: inDepth.friendsAndAssociates },
              { title: 'Influences & Mentors', content: inDepth.influencesAndMentors },
              { title: 'Major Achievements', content: inDepth.achievements },
              { title: 'Notable Quotes', content: inDepth.notableQuotes, isQuote: true },
              { title: 'Funny Anecdotes', content: inDepth.funnyAnecdotes },
              { title: 'Embarrassing Stories', content: inDepth.embarrassingStories },
              { title: 'Enemies & Rivals', content: inDepth.enemies },
              { title: 'Conspiracy Theories', content: inDepth.conspiracyTheories },
          ].filter(s => s.content && s.content.trim() !== '');

          return (
              <ResultCard title="In-Depth Report" titleColor="text-purple-300">
                  {sections.map((section, index) => (
                      <div key={section.title} className={index < sections.length - 1 ? 'mb-4 pb-4 border-b border-gray-700' : ''}>
                          <h4 className="font-bold text-lg mb-2">{section.title}</h4>
                          {section.isQuote ? (
                            <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-300">
                                {section.content}
                            </blockquote>
                          ) : (
                            <p>{section.content}</p>
                          )}
                      </div>
                  ))}
              </ResultCard>
          );
      })()}

      {inDepth && !sixDegrees && (
        <GatedButton cost={2} onClick={onGetSixDegrees} isLoading={isLoading} disabled={isGeneratingImage} loadingText="Connecting history..." actionText="Echoes Through History" className="bg-indigo-600 hover:bg-indigo-500" />
      )}

      {sixDegrees && (
        <ResultCard title="Echoes Through History: A Chain of Connection" titleColor="text-indigo-300">
          <SixDegreesDisplay links={sixDegrees} />
        </ResultCard>
      )}

      {sixDegrees && !familyTree && (
        <GatedButton cost={2} onClick={onGetFamilyTree} isLoading={isLoading} disabled={isGeneratingImage} loadingText="Tracing Lineage..." actionText="Generate Family Tree" className="bg-amber-600 hover:bg-amber-500" />
      )}

      {familyTree && (
        <ResultCard title="Family Tree" titleColor="text-amber-300">
          <FamilyTree root={familyTree} />
        </ResultCard>
      )}
    </>
  );
}

const TopicResults: React.FC<Omit<ResultsDisplayProps, 'data'> & { data: Extract<SearchResult, { type: 'topic' }> }> = 
  ({ data }) => {
  const { query, summary } = data;
  return (
    <ResultCard title={`Summary of ${query.searchTerm}`}>
      <p>{summary}</p>
      <p className="mt-4 text-sm text-gray-400 italic">Further details for general topics are coming soon.</p>
    </ResultCard>
  );
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = (props) => {
  switch (props.data.type) {
    case 'time':
      const { onGetSixDegrees, onGetFamilyTree, ...timeProps } = props;
      return <TimeResults {...timeProps} data={props.data} />;
    case 'person':
      const { onGetTimeline, ...personProps } = props;
      return <PersonResults {...personProps} data={props.data} />;
    case 'topic':
       return <TopicResults {...props} data={props.data} />;
    default:
      return null;
  }
};