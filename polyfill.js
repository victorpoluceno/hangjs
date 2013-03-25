(function (){
    function checkSupport(){
        // FIXME we need more tests here in order to known
        // if datachannel really works
        try {
            var pc = new RTCPeerConnection({"iceServers": 
                [{"url": "stun:stun.l.google.com:19302"}]})
        } catch (e){
            return false;
        }        
        return RTCPeerConnection.prototype.createDataChannel ? true: false;
    }

    function installPolyfill(){
        function RTCDataChannel(configuration){
            // FIXME use bind here
            self = this;
            
            this._udt = new UDT(); // TODO create this fake object
            this._udt.addEventListener('close', function (e){
                self.dispatchEvent(e);
            });
            this._udt.addEventListener('error', function (e){
                self.dispatchEvent(e);
            });

            this.close = function (){
                self._udt.close();
            };

            this.send = function (data){
                self._udt.send(data);
            };
        
            var label = configuration.label
            Object.defineProperty(this, 'label', {
                get: function (){
                    return label;
                }
            });

            var reliable = (configuration.reliable != undefined) ? 
                    configuration.reliable : true
            Object.defineProperty(this, 'reliable', {
                get: function (){
                    return reliable;
                }
            });

            Object.defineProperty(this, 'readyState', {
                get: function (){
                    switch(self._udt.readyState){
                        case 0: return "connecting"
                        case 1: return "open"
                        case 2: return "closing"
                        case 3: return "closed"
                    }                
                }
            });

            Object.defineProperty(this, 'bufferedAmount', {
                get: function (){
                    return self._udt.bufferedAmount;
                }
            });
        }

        RTCDataChannel.prototype = new EventTarget();
        Object.defineProperty(RTCDataChannel, 'onclose', {
            set: function (listener){
                this.addEventListener('close', listener);
            }
        });

        Object.defineProperty(RTCDataChannel, 'onerror', {
            set: function (listener){
                this.addEventListener('error', listener);
            }
        });

        Object.defineProperty(RTCDataChannel, 'onmessage', {
            set: function (listener){
                this.addEventListener('message', listener);
            }
        });

        Object.defineProperty(RTCDataChannel, 'onopen', {
            set: function (listener){
                this.addEventListener('open', listener);
            }
        });

        RTCPeerConnection.prototype.createDataChannel = function(label, dataChannelDict){
            if(!label)
              throw new TypeError('Not enough arguments')
    
            dataChannelDict = dataChannelDict || {}

            // Back-ward compatibility
            if(this.readyState)
              this.signalingState = this.readyState

            if(this.signalingState == "closed")
                throw INVALID_STATE;
        
            var configuration = {label: label}
            if (dataChannelDict.reliable != undefined)
                configuration.reliable = dataChannelDict.reliable;
        
            var channel = new RTCDataChannel(configuration);
            return channel;
        }
    }

    if (!checkSupport()){ 
        installPolyfill();
    }
})()