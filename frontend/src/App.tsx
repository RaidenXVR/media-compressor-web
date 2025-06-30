import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { VideoIcon, ImageIcon, AudioWaveformIcon, FileLock } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex justify-center flex-col p-4 m-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Media Compression Tool</h1>
      <Tabs defaultValue="image" className='text-center items-center'>
        <TabsList>
          <TabsTrigger value="image"><ImageIcon /> Image</TabsTrigger>
          <TabsTrigger value="video"><VideoIcon /> Video</TabsTrigger>
          <TabsTrigger value="audio"> <AudioWaveformIcon />Audio</TabsTrigger>
          <TabsTrigger value="image-steganography"><FileLock />Image Steganography</TabsTrigger>
        </TabsList>
        <TabsContent value="image">
          <MediaCompressor type="image" />
        </TabsContent>
        <TabsContent value="video">
          <MediaCompressor type="video" />
        </TabsContent>
        <TabsContent value="audio">
          <MediaCompressor type="audio" />
        </TabsContent>
        <TabsContent value="image-steganography">
          <MediaCompressor type="image-steganography" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MediaCompressorProps {
  type: 'image' | 'video' | 'audio' | 'image-steganography';
}

const MediaCompressor: React.FC<MediaCompressorProps> = ({ type }) => {
  const [file, setFile] = useState<File | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState([30]);
  const [videoBitrate, setVideoBitrate] = useState([1000]);
  const [audioBitrate, setAudioBitrate] = useState([128]);
  const [message, setMessage] = useState('');
  const [hiddenMessage, setHiddenMessage] = useState('');
  const [isHideMessage, setIsHideMessage] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    try {
      let DEFAULT_URL = `${BASE_URL}/compress/${type}`;
      const formData = new FormData();
      formData.append('file', file);
      if (type === 'image') {
        formData.append('quality', quality[0].toString());
      } else if (type === 'video') {
        formData.append('bitrate', videoBitrate[0].toString());
      } else if (type === 'audio') {
        formData.append('bitrate', audioBitrate[0].toString());
      } else if (type === 'image-steganography') {
        if (isHideMessage) {
          formData.append('message', message);
          DEFAULT_URL = `${BASE_URL}/steganography/image/hide`;
        } else {
          DEFAULT_URL = `${BASE_URL}/steganography/image/reveal`;
        }
      }


      const response = await fetch(DEFAULT_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Compression failed');
      if (type === 'image-steganography' && !isHideMessage) {
        const result = await response.json();
        const text = result.hidden_message || '';
        setHiddenMessage(text);
        setCompressedUrl(null);
        setCompressedSize(null);
        setLoading(false);
        return;
      } else {
        const compressedSize = response.headers.get('Content-Length');
        setCompressedSize(compressedSize ? `${(parseInt(compressedSize) / 1024).toFixed(2)} KB` : null);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setCompressedUrl(url);

      }
    } catch (err) {
      console.error(err);
      alert('Compression failed');
    } finally {
      setLoading(false);
    }
  };

  const isImage = type === 'image' || type === 'image-steganography';
  const isVideo = type === 'video';
  const isAudio = type === 'audio';



  return (
    <div className="space-y-4 mt-4">
      {type === 'image-steganography' && (
        <div className="flex flex-col gap-2 justify-center items-center">
          <label className="inline-flex items-center">
            <Tabs defaultValue='hide' className='text-center items-center'>
              <TabsList>
                <TabsTrigger value="hide" onClick={() => setIsHideMessage(true)}>Hide Message</TabsTrigger>
                <TabsTrigger value="reveal" onClick={() => setIsHideMessage(false)}>Reveal Message</TabsTrigger>
              </TabsList>
            </Tabs>
          </label>
        </div>
      )}
      <Input type="file" accept={`${type == "image-steganography" ? 'image' : type}/*`} onChange={e => {
        setFile(e.target.files?.[0] || null)
      }} />

      {type === 'image-steganography' && isHideMessage && (
        <Input
          type="text"
          placeholder="Enter message to hide"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      )}
      {type === 'image-steganography' && !isHideMessage && (
        <Card>
          <CardContent className="p-2">
            <p className="text-center">{loading ? 'Loading...' : (hiddenMessage !== '' ? hiddenMessage : 'Upload Image and click the button to reveal message.')}</p>
          </CardContent>
        </Card>
      )}
      {type == 'image-steganography' && !isHideMessage && (
        <Button onClick={handleCompress} disabled={!file || loading} className="w-full mt-2">
          {loading ? 'Processing...' : 'Reveal Message'}
        </Button>
      )

      }

      {isImage && type !== 'image-steganography' && (
        <div className="w-full max-w-sm flex items-center gap-2">
          <Slider value={quality} onValueChange={setQuality} max={100} min={0} step={1} />
          <span className="w-[5ch]">{quality[0]}%</span>
        </div>
      )}
      {isVideo && (
        <div className="w-full max-w-sm flex items-center gap-2">
          <Slider value={videoBitrate} onValueChange={setVideoBitrate} max={5000} min={300} step={1} />
          <span className="w-[6ch]">{videoBitrate[0]} kbps</span>
        </div>
      )}
      {isAudio && (
        <div className="w-full max-w-sm flex items-center gap-2">
          <Slider value={audioBitrate} onValueChange={setAudioBitrate} max={320} min={30} step={1} />
          <span className="w-[6ch]">{audioBitrate[0]} kbps</span>
        </div>
      )}
      <div className='flex justify-center gap-4 mt-4' hidden={type === 'image-steganography' && !isHideMessage}>
        <Button onClick={handleCompress} disabled={!file || loading}>
          {loading ? 'Processing...' : (type == 'image-steganography' && isHideMessage ? 'Encrypt' : 'Compress')}
        </Button>
        <Button onClick={() => {
          if (compressedUrl) {
            const link = document.createElement('a');
            link.href = compressedUrl;
            link.download = `compressed_${file?.name}` || 'compressed_file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

        }} disabled={!compressedUrl || loading}>
          Download {type == 'image-steganography' ? 'Encrypted' : 'Compressed'}
        </Button>
      </div>
      {
        compressedUrl && !loading && (
          <div className="grid grid-cols-2 gap-4 mt-4" hidden={type === 'image-steganography' && !isHideMessage}>
            <Card>
              <CardContent className="p-2">
                <p className="text-center font-semibold">Original</p>
                {file && (
                  isImage ? (
                    <img src={URL.createObjectURL(file)} alt="original" className="max-w-full" />
                  ) : isVideo ? (
                    <video controls src={URL.createObjectURL(file)} className="w-full" />
                  ) : (
                    <audio controls src={URL.createObjectURL(file)} className="w-full" />
                  )
                )}
                <p>{file?.size ? (file.size / 1024).toFixed(2) : ''} KB</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2">
                <p className="text-center font-semibold">Compressed</p>
                {compressedUrl && (
                  isImage ? (
                    <img src={compressedUrl} alt="compressed" className="max-w-full" />
                  ) : isVideo ? (
                    <video controls src={compressedUrl} className="w-full" />
                  ) : (
                    <audio controls src={compressedUrl} className="w-full" />
                  )
                )}
                <p>{compressedSize}</p>
              </CardContent>
            </Card>
          </div>
        )
      }
    </div >
  );
};

export default App;
