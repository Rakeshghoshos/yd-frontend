import React,{useState} from 'react';
import environment from './environment';
const AudioComponent = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (link !== '') {
        const response = await axios.post(`${environment.baseUrl}/downloadAudio}`, {
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
      <h1>YouTube Audio Downloader</h1>
      <input
        type="text"
        placeholder="Enter YouTube link"
        onChange={(e) => setLink(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Downloading...' : 'Download Audio'}
      </button>
    </div>
  );
}

export default AudioComponent;