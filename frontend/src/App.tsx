import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { VideoIcon, ImageIcon, AudioWaveformIcon } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="flex justify-center flex-col p-4 m-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Media Compression Tool</h1>
      <Tabs defaultValue="image" className='text-center items-center'>
        <TabsList>
          <TabsTrigger value="image"><ImageIcon /> Image</TabsTrigger>
          <TabsTrigger value="video"><VideoIcon /> Video</TabsTrigger>
          <TabsTrigger value="audio"> <AudioWaveformIcon />Audio</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

interface MediaCompressorProps {
  type: 'image' | 'video' | 'audio';
}

const MediaCompressor: React.FC<MediaCompressorProps> = ({ type }) => {
  const [file, setFile] = useState<File | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState([30]);
  const [videoBitrate, setVideoBitrate] = useState([1000]);
  const [audioBitrate, setAudioBitrate] = useState([128]);


  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (type === 'image') {
        formData.append('quality', quality[0].toString());
      } else if (type === 'video') {
        formData.append('bitrate', videoBitrate[0].toString());
      } else if (type === 'audio') {
        formData.append('bitrate', audioBitrate[0].toString());
      }

      const response = await fetch(`http://localhost:8000/compress/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Compression failed');
      const compressedSize = response.headers.get('Content-Length');
      setCompressedSize(compressedSize ? `${(parseInt(compressedSize) / 1024).toFixed(2)} KB` : null);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
    } catch (err) {
      console.error(err);
      alert('Compression failed');
    } finally {
      setLoading(false);
    }
  };

  const isImage = type === 'image';
  const isVideo = type === 'video';
  const isAudio = type === 'audio';



  return (
    <div className="space-y-4 mt-4">
      <Input type="file" accept={`${type}/*`} onChange={e => {
        setFile(e.target.files?.[0] || null)
      }} />
      {isImage && (
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
      <div className='flex justify-center gap-4 mt-4'>
        <Button onClick={handleCompress} disabled={!file || loading}>
          {loading ? 'Processing...' : 'Compress'}
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
          Download Compressed
        </Button>
      </div>
      {
        compressedUrl && !loading && (
          <div className="grid grid-cols-2 gap-4 mt-4">
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
