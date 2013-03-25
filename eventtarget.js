// FIXME test this code
// EventTarget implementation
function EventTarget(){
    this._listeners = {};
},

EventTarget.prototype = {    
    addEventListener: function (type, listener){
        if (mapListeners[type] === undefined)
            mapListeners[type] = [];

        if (mapListeners[type].indexOf(listener) === -1)
            mapListeners[type].push(handler);
    };

    removeEventListener: function (type, listener){
        var index = mapListeners[type].indexOf(listener);
        if(index !== -1)
            mapListeners[type].splice(index, 1);
    };

    dispatchEvent: function (evt){
        var listListeners = mapListeners[evt.type];
        if (listListeners !== undefined) {
            for (var i=0, listener; listener = listListeners[i]; i++)
                listener.call(this, evt);
        }
    };
}