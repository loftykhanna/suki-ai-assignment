// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { useEffect, useState } from 'react';

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
  const [disabledPlay, setDisabledPlay] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement>()

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMicrophonePermission(true)
        window.localStream = stream;
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
    try {


      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      const audioContext = new AudioContext({
        sampleRate: 16600
      });
      const microphoneSource = audioContext.createMediaStreamSource(stream);


      await audioContext.audioWorklet.addModule('worklet/worker.js');

      // Create an instance of the AudioWorklet node
      const audioWorkletNode = new AudioWorkletNode(audioContext, 'custom-audio-processor');

      const timerId = setInterval(() => {
        console.log('read-bytes after 100ms')
        audioWorkletNode.port.postMessage({ command: 'read-buffer' });
      }, 100)

      console.log(audioWorkletNode)

      audioWorkletNode.port.onmessage = (
        { data }
      ) => {
        console.log('data', data)
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
        clearInterval(timerId)
        console.log('stop event from media recorder')

        console.log('posting message')
        audioWorkletNode.port.postMessage({ command: 'audio-ended' });

        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        chunks = [];
        const audioURL = URL.createObjectURL(audioBlob);
        setAudio(new Audio(audioURL))
        setDisableStartButton(false);
        setDisableStopButton(true)
        setDisabledPlay(false)
      });

      setDisableStartButton(true)
      setDisableStopButton(false)
    }
    catch (error) {
      console.error('Error accessing microphone:', error);
    };
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
    <div className={styles.app}>

      <div className={styles.content}>
        <div className={styles.header}>
          Suki Assignment
        </div>
        <input className={styles.button} type='button' value='Start' onClick={startRecording} disabled={disableStartButton} />
        <input className={styles.button} type='button' value='Stop' onClick={stopRecording} disabled={disableStopButton} />
        <input className={styles.button} type='button' value='play' onClick={playAudio} disabled={disabledPlay} />
      </div>
    </div>
  );

}

export default App;
