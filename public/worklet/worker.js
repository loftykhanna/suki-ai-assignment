class CustomAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // IN float32 its 4 but we converted it to int 16 so considering it 2
    // this.bytesPerSample = 4;
    this.bytesPerSample = 2;

    // As now we are only listening to left channel so marking channel as 1 
    //this.ChannelCount = 2;
    this.ChannelCount = 1;


    this.desiredBytesPerChunk = 3200; //in KB
    this.bufferSize =
      this.desiredBytesPerChunk / (this.bytesPerSample * this.ChannelCount);
    // Track the current buffer fill level
    this.bytesWritten = 0;
    // for transmitting 100ms data
    this.internalbytesWritten = 0;


    // Create a buffer of fixed size
    this.buffer = new Array(this.bufferSize);
    // buffer for transmitting 100ms data
    this.internalBuffer = new Array(this.bufferSize);
    this.chunkCounter = 0; // Counter for tracking chunks

    this.stopProcess = false;

    this.port.onmessage = (event) => {
      if (event.data.command === 'audio-ended') {
        // stop the process and send the buffer
        console.log('stoping the processing');
        this.stopProcessing();
      }

      if (event.data.command === 'read-buffer') {
        // stop the process and send the buffer
        console.log('sending 100ms buffer');
        this.send100msData();
      }
    };

   /*  setTimeout(()=>{
      console.log('hii')
    }, 1000) */
   // this.throttledSendData = this.customThrottle(()=>this.sendData(false), 100)
  
  }

  process(inputs, outputs, _parameters) {
    // Stop the process on stop of audio
    if (this.stopProcess) {
      return false;
    }

    // As per disscussion with sai - only processing the left node
    const input = inputs[0];
    // const output = outputs[0];
   // const outputChannelDataLeft = output[0];
    // const outputChannelDataRight = output[1];

    const inputLeftChannel = input[0]; // Left channel
    //const inputRightChannel = inputs[1]; // Right channel

    const bytesPerSampleLeft =
      inputLeftChannel.buffer.byteLength / inputLeftChannel.length;
    // const bytesPerSampleRight = inputRightChannel.buffer.byteLength / inputRightChannel.length;
    //console.log('bytesPerSampleLeft - input', bytesPerSampleLeft);

    //console.log( 'inpuuts', inputs[0][0].length)
    const sampleCount = inputLeftChannel.length;
    // Get the sample rate of the audio context

    const outputInt16LeftArray = new Int16Array(sampleCount);
  //  const outputInt16RightArray = new Int16Array(sampleCount);

    for (let i = 0; i < sampleCount; i++) {
      // Convert the left channel audio data from 32-bit float to 16-bit integer
      const floatSampleLeft = inputLeftChannel[i];
      const intSampleLeft = Math.round(floatSampleLeft * 32767); // Scale to the range of a 16-bit signed integer
      const normalizedSampleLeft = Math.max(
        -32768,
        Math.min(32767, intSampleLeft)
      ); // Normalize back to the range of -1 to 1 as float
      outputInt16LeftArray[i] = normalizedSampleLeft;

      // Convert the right channel audio data from 32-bit float to 16-bit integer
      // const floatSampleRight = inputChannelDataRight[i];
      // const intSampleRight = Math.round(floatSampleRight * 32767); // Scale to the range of a 16-bit signed integer
      // const normalizedSampleRight = Math.max(-32768, Math.min(32767, intSampleRight)); // Normalize back to the range of -1 to 1 as float
      //outputInt16RightArray[i] = normalizedSampleRight


    }


    const bytesPerSampleLeftOutput =
      outputInt16LeftArray.buffer.byteLength / outputInt16LeftArray.length;
    // const bytesPerSampleRightOutput = outputChannelDataRight.buffer.byteLength / inputRightChannel.length;
    //console.log('bytesPerSampleLeftOutput --- output', bytesPerSampleLeftOutput);

    this.transmitProcessedAudio(outputInt16LeftArray);

    return true;
  }

  stopProcessing() {
    this.stopProcess = true;
    this.sendData();
  }

  isBufferEmpty() {
    return this.bytesWritten === 0;
  }

  isBufferFull() {
    return this.bytesWritten === this.bufferSize;
  }

  sendData() {
    // trim the buffer if ended prematurely
    this.port.postMessage(
      this.bytesWritten < this.bufferSize
        ? this.buffer.slice(0, this.bytesWritten)
        : this.buffer
    );
    this.bytesWritten = 0;
  }

  send100msData() {
    // trim the buffer if ended prematurely
    this.port.postMessage(
      this.internalbytesWritten < this.bufferSize
        ? this.internalBuffer.slice(0, this.internalbytesWritten)
        : this.internalBuffer
    );
    this.internalbytesWritten = 0;
  }



  transmitProcessedAudio(sample) {
    if (!sample) return;

    if (this.isBufferFull()) {
      this.sendData();
    }
    this.buffer[this.bytesWritten] = sample;
    this.internalBuffer[this.bytesWritten] = sample;
    /*    
    below code was written when I was taking sample as input/output
    const leftChannelData = sample[0][0];
    const rightChannelData = sample[0][1];
    this.buffer[this.bytesWritten] = [];
    this.buffer[this.bytesWritten][0] = new Float32Array(
      leftChannelData.length
    );
    this.buffer[this.bytesWritten][1] = new Float32Array(
      rightChannelData.length
    );
    for (let i = 0; i < leftChannelData.length; i++) {
      this.buffer[this.bytesWritten][0][i] = leftChannelData[i];
      this.buffer[this.bytesWritten][1][i] = rightChannelData[i];
    } */

    this.bytesWritten++;
    this.internalbytesWritten++;
  }


  customThrottle(cb, delay){
      let wait = false;
      let storedArgs = null;
    
      function checkStoredArgs () {
        if (storedArgs == null) {
          wait = false;
        } else {
          cb(...storedArgs);
          storedArgs = null;
          require('timers').setTimeout(checkStoredArgs, delay);
        }
      }
    
      return (...args) => {
        if (wait) {
          storedArgs = args;
          return;
        }
    
        cb(...args);
        wait = true;
        require('timers').setTimeout(checkStoredArgs, delay);
  }
}
}

registerProcessor('custom-audio-processor', CustomAudioProcessor);
