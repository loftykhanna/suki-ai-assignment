class TestProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
  
      // Logs the current sample-frame and time at the moment of instantiation.
      // They are accessible from the AudioWorkletGlobalScope.
      // eslint-disable-next-line no-undef
      console.log(currentFrame);
      // eslint-disable-next-line no-undef
      console.log(currentTime);
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
    
    console.log( 'inpuuts', inputs[0][0].length)
    const sampleCount = inputChannelDataLeft.length;
 // Get the sample rate of the audio context
    // eslint-disable-next-line no-undef
    const chunkSize = Math.floor((sampleRate * 0.1) * 3200 / 1024); // Calculate the number of samples for each chunk
   // eslint-disable-next-line no-undef
   console.log('chunkSize,', chunkSize, sampleRate)
    
    for (let i = 0; i < sampleCount; i++) {
      // Convert the left channel audio data from 32-bit float to 16-bit integer
      const floatSampleLeft = inputChannelDataLeft[i];
      const intSampleLeft = Math.round(floatSampleLeft * 32767); // Scale to the range of a 16-bit signed integer
      const normalizedSampleLeft = intSampleLeft / 32767; // Normalize back to the range of -1 to 1 as float
      
      // Convert the right channel audio data from 32-bit float to 16-bit integer
      const floatSampleRight = inputChannelDataRight[i];
      const intSampleRight = Math.round(floatSampleRight * 32767); // Scale to the range of a 16-bit signed integer
      const normalizedSampleRight = intSampleRight / 32767; // Normalize back to the range of -1 to 1 as float
      
      // Process the audio data or perform any desired operations for both channels
      // ...
      
      // Store the processed audio data in the output buffers for both channels
      outputChannelDataLeft[i] = normalizedSampleLeft;
      outputChannelDataRight[i] = normalizedSampleRight;
      output[0][i] = outputChannelDataLeft
      output[1][i] = outputChannelDataRight 

    }

    if (this.chunkCounter >= 100) {
      this.chunkCounter = 0;

      // Notify that two chunks have been processed
      this.port.postMessage('processed');
    }

    this.port.postMessage(
     output
    )
      // eslint-disable-next-line no-undef
      console.log('sampleRate,', sampleRate, inputs, JSON.stringify(output).replace(/[\[\]\,\"]/g,'').length);
       //stringify and remove all "stringification" extra data
            return true;
    }
  }

  
  // Logs the sample rate, that is not going to change ever,
  // because it's a read-only property of a BaseAudioContext
  // and is set only during its instantiation.
  // eslint-disable-next-line no-undef

  
  // You can declare any variables and use them in your processors
  // for example it may be an ArrayBuffer with a wavetable
  const usefulVariable = 42;
  console.log(usefulVariable);
  
  registerProcessor("test-processor", TestProcessor);