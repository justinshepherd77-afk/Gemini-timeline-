import React from 'react';
import type { TimelineEvent } from '../types';

interface TimelineProps {
  events: TimelineEvent[];
}

const eventTypeStyles = {
    preceding: {
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-400',
      textColor: 'text-blue-200'
    },
    main: {
      borderColor: 'border-amber-400',
      bgColor: 'bg-amber-400',
      textColor: 'text-amber-100'
    },
    succeeding: {
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-400',
      textColor: 'text-purple-200'
    }
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {

  const sortedEvents = [...events].sort((a, b) => {
    const yearA = parseInt(a.year.match(/\d+/)?.[0] || '0');
    const yearB = parseInt(b.year.match(/\d+/)?.[0] || '0');
    return yearA - yearB;
  });

  return (
    <div className="relative border-l-2 border-gray-600 ml-4 py-4">
      {sortedEvents.map((event, index) => {
        const styles = eventTypeStyles[event.type];
        return (
          <div key={index} className="mb-8 ml-8 relative">
             <div className={`absolute -left-[39px] mt-2.5 w-4 h-4 rounded-full border-2 ${styles.borderColor} ${styles.bgColor}`}></div>
            <time className={`text-sm font-semibold leading-none ${styles.textColor}`}>
              {event.year} - <span className="capitalize">{event.type}</span>
            </time>
            <h4 className="text-lg font-bold text-gray-100 mt-1">{event.event}</h4>
            {event.interestingDetail && (
                <p className="mt-2 text-sm text-gray-400 italic">
                    &ldquo;{event.interestingDetail}&rdquo;
                </p>
            )}
          </div>
        );
      })}
    </div>
  );
};