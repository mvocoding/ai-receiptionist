import React, { useEffect, useMemo, useRef, useState } from 'react';

type Rec = {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  duration: number;
  status: 'completed' | 'missed';
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  assignee: string;
  transcript: string;
  audioUrl: string;
};

const MOCK_RECORDINGS: Rec[] = [
  {
    id: 'rec_101',
    callerName: 'Jordan Smith',
    callerNumber: '+64 21 555 1024',
    timestamp: 'Today · 10:42 AM',
    duration: 132,
    status: 'completed',
    sentiment: 'positive',
    tags: ['booking', 'fade'],
    assignee: 'Barber · Ace',
    transcript:
      "Hey, I was wondering if you have any availability for a skin fade tomorrow after 3pm? I'm flexible on the time. Also what's the price for beard trim add-on?",
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2021/09/16/audio_8c4d3f2b7d.mp3?filename=click-124467.mp3',
  },
  {
    id: 'rec_102',
    callerName: 'Unknown',
    callerNumber: 'Private',
    timestamp: 'Today · 9:05 AM',
    duration: 0,
    status: 'missed',
    sentiment: 'neutral',
    tags: ['missed', 'callback'],
    assignee: 'Unassigned',
    transcript:
      'Missed call. AI sent an SMS asking for preferred time and service.',
    audioUrl: '',
  },
  {
    id: 'rec_103',
    callerName: 'Emily Chen',
    callerNumber: '+64 27 880 3344',
    timestamp: 'Yesterday · 4:18 PM',
    duration: 245,
    status: 'completed',
    sentiment: 'neutral',
    tags: ['reschedule', 'line-up'],
    assignee: 'Barber · Jay',
    transcript:
      'Hi, I need to move my appointment from Friday to Saturday morning if possible. Also, can I change from a standard cut to a line-up and taper?',
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2022/03/15/audio_e6a3b.mp3?filename=notification-112557.mp3',
  },
  {
    id: 'rec_104',
    callerName: 'Leo Martinez',
    callerNumber: '+64 22 901 7777',
    timestamp: 'Mon · 2:30 PM',
    duration: 188,
    status: 'completed',
    sentiment: 'neutral',
    tags: ['booking', 'fade'],
    assignee: 'Barber · Ace',
    transcript:
      'I would like to book a fade haircut for tomorrow. Also, can you tell me if you have time for a beard trim?',
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2021/09/16/audio_8c4d3f2b7d.mp3?filename=click-124467.mp3',
  },
];

const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Rec[]>(MOCK_RECORDINGS);
  const [filter, setFilter] = useState<'all' | 'completed' | 'missed'>('all');

  const filteredRecordings = useMemo(() => {
    if (filter === 'all') return recordings;
    return recordings.filter((rec) => rec.status === filter);
  }, [filter, recordings]);

  return (
    <div>
      <h1>Recordings</h1>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('missed')}>Missed</button>
      </div>
      <ul>
        {filteredRecordings.map((rec) => (
          <li key={rec.id}>
            <h2>{rec.callerName}</h2>
            <p>{rec.timestamp}</p>
            <p>Duration: {rec.duration} seconds</p>
            <p>Status: {rec.status}</p>
            <p>Sentiment: {rec.sentiment}</p>
            <p>Tags: {rec.tags.join(', ')}</p>
            <p>Assignee: {rec.assignee}</p>
            <p>Transcript: {rec.transcript}</p>
            {rec.audioUrl && (
              <audio controls>
                <source src={rec.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recordings;
