class TestProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.bytesPerSample = 4;
      this.ChannelCount = 2
      this.desiredBytesPerChunk = 3200 //in KB
      this.bufferSize =   this.desiredBytesPerChunk/(this.bytesPerSample*this.ChannelCount);
  // 1. Track the current buffer fill level
       this.bytesWritten = 0

  // 2. Create a buffer of fixed size
   this.buffer = new Array(this.bufferSize)
  
      // Logs the current sample-frame and time at the moment of instantiation.
      // They are accessible from the AudioWorkletGlobalScope.
      // eslint-disable-next-line no-undef
     // console.log(currentFrame);
      // eslint-disable-next-line no-undef
    //  console.log(currentTime);
      this.chunkCounter = 0; // Counter for tracking chunks
      
    }
  
    // The process method is required - output silence,
    // which the outputs are already filled with.
    process(inputs, outputs, _parameters) {

      const input = inputs[0];
    const output = outputs[0];
    const inputChannelDataLeft = input[0];
    const inputChannelDataRight = input[1];
    const outputChannelDataLeft = output[0];
    const outputChannelDataRight = output[1];

    const inputLeftChannel = inputs[0][0]; // Left channel
    const inputRightChannel = inputs[0][1]; // Right channel

    const bytesPerSampleLeft = inputLeftChannel.buffer.byteLength / inputLeftChannel.length;
    const bytesPerSampleRight = inputRightChannel.buffer.byteLength / inputRightChannel.length;
    //console.log('bytesPerSampleLeft', bytesPerSampleLeft, bytesPerSampleRight)
    
    //console.log( 'inpuuts', inputs[0][0].length)
    const sampleCount = inputChannelDataLeft.length;
 // Get the sample rate of the audio context
    // eslint-disable-next-line no-undef
    const chunkSize = Math.floor((sampleRate * 0.1) * 3200 / 1024); // Calculate the number of samples for each chunk
   // eslint-disable-next-line no-undef
   //console.log('chunkSize,', chunkSize, sampleRate)
    
   // for (let i = 0; i < sampleCount; i++) {
      // Convert the left channel audio data from 32-bit float to 16-bit integer
      /* const floatSampleLeft = inputChannelDataLeft[i];
      const intSampleLeft = Math.round(floatSampleLeft * 32767); // Scale to the range of a 16-bit signed integer
      const normalizedSampleLeft = Math.max(-32768, Math.min(32767, intSampleLeft)); // Normalize back to the range of -1 to 1 as float
      console.log('normalizedSampleLeft', normalizedSampleLeft)
      // Convert the right channel audio data from 32-bit float to 16-bit integer
      const floatSampleRight = inputChannelDataRight[i];
      const intSampleRight = Math.round(floatSampleRight * 32767); // Scale to the range of a 16-bit signed integer
      const normalizedSampleRight = Math.max(-32768, Math.min(32767, intSampleRight)); // Normalize back to the range of -1 to 1 as float
      
      // Process the audio data or perform any desired operations for both channels
      // ...
      
      // Store the processed audio data in the output buffers for both channels
      outputs[0][0][i] = normalizedSampleLeft;
      outputs[0][1][i] = normalizedSampleRight; */


      //   }


      this.transmitProcessedAudio(inputs)


         const bytesPerSampleLeftOutput = outputChannelDataLeft.buffer.byteLength / inputLeftChannel.length;
         const bytesPerSampleRightOutput = outputChannelDataRight.buffer.byteLength / inputRightChannel.length;
        // console.log('bytesPerSampleLeftOutput', bytesPerSampleLeftOutput, bytesPerSampleRightOutput)
       
   

/*     if (this.chunkCounter >= 100) {
      this.chunkCounter = 0;

      // Notify that two chunks have been processed
      this.port.postMessage('processed');
    }

    this.port.postMessage(
     output
    ) */
      // eslint-disable-next-line no-undef
    //  console.log('sampleRate,', sampleRate, inputs, JSON.stringify(output).replace(/[\[\]\,\"]/g,'').length);
       //stringify and remove all "stringification" extra data
            return true;
    }

    isBufferEmpty() {
      return this.bytesWritten === 0
    }

    isBufferFull() {
      return this.bytesWritten === this.bufferSize
    }

    sendData(){
       // trim the buffer if ended prematurely
    this.port.postMessage(
      this.bytesWritten < this.bufferSize
        ? this.buffer.slice(0, this.bytesWritten)
        : this.buffer
    )
    this.bytesWritten =0
    }

    transmitProcessedAudio(sample){
      if (!sample) return

      if (this.isBufferFull()) {
        this.sendData()
      }
      const leftChannelData = sample[0][0]
      const rightChannelData = sample[0][1]
      this.buffer[this.bytesWritten] = [];
      this.buffer[this.bytesWritten][0] = new Float32Array(leftChannelData.length);
      this.buffer[this.bytesWritten][1] =  new Float32Array(rightChannelData.length);
      for (let i = 0; i < leftChannelData.length; i++) {
        this.buffer[this.bytesWritten][0][i] = leftChannelData[i];
        this.buffer[this.bytesWritten][1][i] = rightChannelData[i]
      }
      this.bytesWritten++
    }
  
  }

  
  // Logs the sample rate, that is not going to change ever,
  // because it's a read-only property of a BaseAudioContext
  // and is set only during its instantiation.
  // eslint-disable-next-line no-undef

  
  // You can declare any variables and use them in your processors
  // for example it may be an ArrayBuffer with a wavetable
  const usefulVariable = 42;
  //console.log(usefulVariable);
  
  registerProcessor("test-processor", TestProcessor);