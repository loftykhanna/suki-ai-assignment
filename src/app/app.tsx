// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

import React, { useEffect, useState } from 'react';

const constraints = {
  audio: {
    sampleRate: { ideal: 16600 },
    format: 'wav'
  }
};

let audioStream: MediaStream, mediaRecorder: MediaRecorder;

let chunks: BlobPart[] = []

export function App() {

  const [isMicrophonePermissionEnabled, setMicrophonePermission] = useState(false);
  const [disableStartButton, setDisableStartButton] = useState(false);
  const [disableStopButton, setDisableStopButton] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement>()

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMicrophonePermission(true)
        window.localStream = stream; // A
        //window.localAudio.srcObject = stream; // B
        //window.localAudio.autoplay = true; // C
      })
      .catch((err) => {
        setMicrophonePermission(false)
        console.error(`you got an error: ${err}`);
      });
  }

  useEffect(() => {
    getLocalStream()
  }, [])


  const startRecording = async () => {
    // try{


    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    const audioContext = new AudioContext({
      sampleRate: 16600
    });
    const microphoneSource = audioContext.createMediaStreamSource(stream);


    await audioContext.audioWorklet.addModule('public/worklet/worker.js');

    // Create an instance of the AudioWorklet node
    const audioWorkletNode = new AudioWorkletNode(audioContext, 'test-processor');
    audioWorkletNode.port.onmessage = (
      {data}
    ) => {
      console.log('data', data) 
      // `data` is a Float32Array array containing our audio samples 
    }

    audioWorkletNode.connect(audioContext.destination);

    microphoneSource.connect(audioWorkletNode);





    console.log('getting stream', stream)
    audioStream = stream;
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', event => {
      console.log('data added')
      chunks.push(event.data);
    });
    mediaRecorder.start();

    mediaRecorder.addEventListener('stop', () => {
      console.log('stop event from media recorder')
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      chunks = [];
      const audioURL = URL.createObjectURL(audioBlob);
      setAudio(new Audio(audioURL))
      setDisableStartButton(false);
      setDisableStopButton(true)
    });

    setDisableStartButton(true)
    setDisableStopButton(false)
    /*  }
       catch(error){
         console.error('Error accessing microphone:', error);
       }; */
  }

  const stopRecording = () => {
    mediaRecorder.stop();
    audioStream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const playAudio = () => {
    audio?.play()
  }


  if (!isMicrophonePermissionEnabled) {
    return (<div> Micorophone is not enabled - Please enable</div>)
  }


  return (
    <div className="App">
      <header className="App-header">
        <input type='button' value='Start' onClick={startRecording} disabled={disableStartButton} />
        <input type='button' value='Stop' onClick={stopRecording} disabled={disableStopButton} />
        <input type='button' value='play' onClick={playAudio} />
      </header>
    </div>
  );

}

export default App;
