var _tkreis$snapshot$Native_HtmlAsJson = (function() {
  return {
    unsafeCoerce: function(a) {
      return a;
    },
    eventDecoder: function(event) {
      return event.decoder;
    },
    eventHandler: F2(function(eventName, html) {
      return html.facts.EVENT[eventName];
    }),
    taggerFunction: function(tagger) {
      return tagger;
    }
  };
})();
