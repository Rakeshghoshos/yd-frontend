import axios from 'axios';
import React, { useState } from 'react';
import environment from './environment';
import './App.css';
import VideoProgress from './VideoProgress.tsx';

function App() {
  const [link, setLink] = useState('');
  const [getDetails, setGetDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingChapters, setLoadingChapters] = useState({});
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const chaptersPerPage = 5;

  const handleLinkSubmit = async () => {
    if (link) {
      const response = await axios.post(`${environment.baseUrl}/fetchDetails`, {
        url: link,
      });
      setGetDetails(response.data);
      setCurrentPage(1); 
    }
  };

  const chapters = getDetails?.data?.chapters || [];
  const totalPages = Math.ceil(chapters.length / chaptersPerPage);

  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = chapters.slice(indexOfFirstChapter, indexOfLastChapter);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const downloadVideo = async (start_time, end_time, index, type = "timestamps") => {
    setLoadingChapters((prevState) => ({ ...prevState, [index]: true }));
    if (type === "full") setLoadingVideo(true);
    else setLoading(true);
    try {
      if (link !== '') {
        const response = await axios.post(
          `${environment.baseUrl}/downloadVideo`,
          {
            url: link,
            start_time: start_time,
            end_time: end_time,
          },
          {
            responseType: 'blob',
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.setAttribute('download', 'video-file.mp4');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(url);

        if (type === "full") setLoadingVideo(false);
        else setLoading(false);
      } else {
        console.log("Please enter a valid YouTube link.");
      }
    } catch (error) {
      console.error("Error downloading video:", error);
    } finally {
      setLoadingChapters((prevState) => ({ ...prevState, [index]: false }));
      setLoading(false);
    }
  };

  const downloadAudio = async () => {
    setLoadingAudio(true);
    try {
      if (link !== '') {
        const response = await axios.post(`${environment.baseUrl}/downloadAudio`, {
          url: link, 
        }, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.setAttribute('download', 'audio-file.mp3');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(url);
        setLoadingAudio(false);
      } else {
        console.log("Please enter a valid YouTube link.");
      }
    } catch (error) {
      console.error("Error downloading audio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="centered-container">
        <div className='bg-slate-900 text-white p-6 text-lg rounded-lg bg-opacity-50'>
          <h1 className='text-center'>YouTube Media Downloader</h1><br />
          <p>YouTube Media Downloader is a web-based platform that allows users to download videos 
            and audio directly from YouTube with ease. 
            This online tool enables you to quickly save high-quality
           media files for offline viewing and listening without needing any software installation.</p>
        </div>
        <br/>
        <div className="flex flex-col gap-4 justify-center align-center bg-slate-900 rounded-lg bg-opacity-50 p-6 text-center">
          <div>
            <div>Enter the YouTube link:</div>
            <div>
              <input
                type="text"
                placeholder="Enter YouTube link"
                onChange={(e) => setLink(e.target.value)}
                className='text-black p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/2'
              />
              <br />
              <br/>
              <button onClick={handleLinkSubmit}>Get Details</button>
            </div>
          </div>

          {getDetails?.data && (
            <>
              <h2>Video Length: {getDetails.data.videoLengthFormatted}</h2>
              <div className="chapters-list">
  {chapters.length > 0 ? (
   <>
       <table className="chapters-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Timestamp</th>
          <th>Download</th>
        </tr>
      </thead>
      <tbody>
        {currentChapters.map((chapter, index) => (
          <tr key={index}>
            <td>{chapter.title}</td>
            <td className="timestamp">
              {chapter.start_time_formatted} - {chapter.end_time_formatted}
            </td>
            <td>
              <button
                onClick={() =>
                  downloadVideo(
                    chapter.start_time_formatted,
                    chapter.end_time_formatted,
                    index,
                    "timestamps"
                  )
                }
                disabled={loadingChapters[index] || loading}
              >
                {loadingChapters[index] ? 'Downloading...' : 'Download'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    <p>want to get your custom timeframe video ? select the time frame</p><br />
    <VideoProgress videoLengthSeconds={getDetails.data.videoLengthFormatted} downloadVideo={downloadVideo}/>
   </>
  ) : (
    <>
      <div>No Default timestamps found </div>
      <p>want to get your custom timeframe video ? select the time frame</p><br/>
      <VideoProgress videoLengthSeconds={getDetails.data.videoLengthFormatted} downloadVideo={downloadVideo}/>
    </>
  )}

                <br />
              </div>
              <br />
              <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1 || chapters.length === 0 || loading}>
                  Previous
                </button>&nbsp;&nbsp;
                <button onClick={handleNextPage} disabled={currentPage === totalPages || chapters.length === 0 || loading}>
                  Next
                </button><br />
                <span>Page {totalPages === 0 ? 0 : currentPage} of {totalPages}</span>
              </div>
              <br />

              <div>
                <h1>Download the full video </h1>
                <button
                  onClick={() =>
                    downloadVideo("00:00:00", getDetails.data.videoLengthFormatted, 0, "full")
                  }
                  disabled={loadingVideo}
                >
                  {loadingVideo ? 'Downloading...' : 'Download'}
                </button>
              </div>
              <br />
              <div>
                <h2>Want to Download Audio? Click below</h2>
                <button
                  onClick={() => downloadAudio()}
                  disabled={loadingAudio}
                >
                  {loadingAudio ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
