
import React, { useMemo, useState, useEffect } from 'react';
import { REGIONS_DATA, TOPICS, CITIES_DATA } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface QueryBuilderProps {
  century: number;
  setCentury: (value: number) => void;
  year: number;
  setYear: (value: number) => void;
  region: string;
  setRegion: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
  searchMode: 'time' | 'search';
  setSearchMode: (mode: 'time' | 'search') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const InputGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    <label className="block text-sm font-medium text-cyan-300 mb-2">{label}</label>
    {children}
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-300 ${
            active 
                ? 'bg-gray-700 border-b-2 border-cyan-400 text-cyan-300' 
                : 'text-gray-400 hover:bg-gray-700/50'
        }`}
    >
        {children}
    </button>
);

const formatCentury = (c: number): string => {
  if (c < 0) {
    const num = -c;
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Century BCE`;
  }
  const suffix = c === 1 ? 'st' : c === 2 ? 'nd' : c === 3 ? 'rd' : 'th';
  return `${c}${suffix} Century CE`;
}


export const QueryBuilder: React.FC<QueryBuilderProps> = (props) => {
  const { 
    century, setCentury, year, setYear, region, setRegion, country, setCountry, city, setCity, topic, setTopic, 
    searchMode, setSearchMode, searchTerm, setSearchTerm, 
    onSearch, isLoading 
  } = props;

  const [showYearTooltip, setShowYearTooltip] = useState(false);
  const { user } = useAuth();

  const countries = useMemo(() => REGIONS_DATA[region] || [], [region]);
  const cities = useMemo(() => CITIES_DATA[country] || CITIES_DATA['Default'] || [], [country]);
  
  const yearRange = useMemo(() => {
    if (century > 0) {
      const start = (century - 1) * 100;
      return { min: start, max: start + 99 };
    } else { // century < 0
      const start = century * 100;
      return { min: start, max: start + 99 };
    }
  }, [century]);

  useEffect(() => {
    if (countries.length > 0 && !countries.includes(country)) {
      setCountry(countries[0]);
    }
  }, [countries, country, setCountry]);

  useEffect(() => {
    if (cities.length > 0) {
        setCity(cities[0]);
    } else {
        setCity('');
    }
  }, [country, setCity]); // city list is derived from country
  
  useEffect(() => {
     if (year < yearRange.min || year > yearRange.max) {
      setYear(yearRange.min);
    }
  }, [year, yearRange, setYear]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    setRegion(newRegion);
    setCountry(REGIONS_DATA[newRegion][0]);
  };
  
  const handleCenturyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCentury = Number(e.target.value);
    // Prevent skipping from -1 to 1 by handling the '0' case
    if (newCentury === 0) {
      setCentury(century < 0 ? -1 : 1);
    } else {
      setCentury(newCentury);
    }
  }

  const renderSearchButton = () => {
    if (user.status === 'pending') {
      return (
        <button disabled className="w-full mt-2 bg-gray-600 text-gray-400 cursor-not-allowed font-bold py-3 px-4 rounded-lg">
          Awaiting Approval
        </button>
      );
    }

    const isSearchDisabled = isLoading || (searchMode === 'search' && !searchTerm.trim());
    const costText = 'Free';

    return (
      <button
        onClick={onSearch}
        disabled={isSearchDisabled}
        className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        {isLoading ? 'Exploring...' : `Uncover History (${costText})`}
      </button>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 shadow-xl">
        <div className="flex border-b border-gray-700">
            <TabButton active={searchMode === 'time'} onClick={() => setSearchMode('time')}>Time Explorer</TabButton>
            <TabButton active={searchMode === 'search'} onClick={() => setSearchMode('search')}>Person/Topic Search</TabButton>
        </div>

      <div className="p-6">
        {searchMode === 'time' ? (
            <>
              <InputGroup label={`Century: ${formatCentury(century)}`}>
                <input type="range" min="-20" max="21" value={century} onChange={handleCenturyChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </InputGroup>
              <InputGroup label={`Year: ${year < 0 ? `${-year} BCE` : year}`}>
                <div className="relative">
                  {showYearTooltip && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-cyan-600 text-white text-xs rounded">{year < 0 ? `${-year} BCE` : year}</div>}
                  <input type="range" min={yearRange.min} max={yearRange.max} value={year} onChange={(e) => setYear(Number(e.target.value))} onMouseDown={() => setShowYearTooltip(true)} onMouseUp={() => setShowYearTooltip(false)} onTouchStart={() => setShowYearTooltip(true)} onTouchEnd={() => setShowYearTooltip(false)} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
              </InputGroup>
              <InputGroup label="Region">
                <select value={region} onChange={handleRegionChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                  {Object.keys(REGIONS_DATA).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </InputGroup>
              <InputGroup label="Country">
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </InputGroup>
              <InputGroup label="City / Location">
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50" disabled={cities.length === 0}>
                  {cities.length > 0 ? cities.map(c => <option key={c} value={c}>{c}</option>) : <option>No cities available</option>}
                </select>
              </InputGroup>
              <InputGroup label="Topic">
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500">
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </InputGroup>
            </>
        ) : (
            <InputGroup label="Search for a Person or Topic">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., Leonardo da Vinci or The Renaissance"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </InputGroup>
        )}
        {renderSearchButton()}
      </div>
    </div>
  );
};
