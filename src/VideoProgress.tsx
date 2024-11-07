import React, { useState } from 'react';

export default function VideoProgress({ videoLengthSeconds ,downloadVideo}:any) {
  const [start, setStart] = useState(0); // Start in seconds
  const [end, setEnd] = useState(videoLengthSeconds); // End in seconds

  const formatTime = (seconds:any) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };


  const handleDownload = () => {
    downloadVideo(formatTime(start), formatTime(end),0,"timestamps");
  };

  return (
    <div className="video-progress">
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={videoLengthSeconds}
          value={start}
          onChange={(e) => setStart(Math.min(Number(e.target.value), end))}
          className="slider slider-start"
        />&nbsp;&nbsp;
        <input
          type="range"
          min="0"
          max={videoLengthSeconds}
          value={end}
          onChange={(e) => setEnd(Math.max(Number(e.target.value), start))}
          className="slider slider-end"
        />
      </div>

      <div className="timestamps ">
        <span className='m-4'>Selected Start: {formatTime(start)}</span>
        <span>Selected End: {formatTime(end)}</span>
      </div>

      <button onClick={handleDownload}>Download Selected Range</button>
    </div>
  );
}

