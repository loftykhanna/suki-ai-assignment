class TestProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
  
      // Logs the current sample-frame and time at the moment of instantiation.
      // They are accessible from the AudioWorkletGlobalScope.
      console.log(currentFrame);
      console.log(currentTime);
    }
  
    // The process method is required - output silence,
    // which the outputs are already filled with.
    process(_inputs, _outputs, _parameters) {
      return true;
    }
  }
  
  // Logs the sample rate, that is not going to change ever,
  // because it's a read-only property of a BaseAudioContext
  // and is set only during its instantiation.
  console.log(sampleRate);
  
  // You can declare any variables and use them in your processors
  // for example it may be an ArrayBuffer with a wavetable
  const usefulVariable = 42;
  console.log(usefulVariable);
  
  registerProcessor("test-processor", TestProcessor);