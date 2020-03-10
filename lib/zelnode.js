'use strict';

var Common = require('./common');

function ZelNodeController(node) {
  this.node = node;
  this.common = new Common({log: this.node.log});
}

// looks like i need to have it in separate call as was causing issues
ZelNodeController.prototype.listZelNodes = function(req, res) {
  this.node.services.bitcoind.viewdeterministiczelnodelist(function(err, response) {
    if (err) {
      res.jsonp(err);
    }
    res.jsonp(response);
  });
};

ZelNodeController.prototype.listZelNodesFilter = function(req, res) {
  var filter = req.params.filter;
  this.node.services.bitcoind.viewdeterministiczelnodelist(function(err, response) {
    if (err) {
      res.jsonp(err);
    }
    if (!filter) {
      res.jsonp(response);
    }
    const filteredList = response.result.filter(function(zelnode) {
      return JSON.stringify(zelnode).includes(filter);
    })
    res.jsonp({
      result: filteredList,
      error: response.error,
      id: response.id
    })
  });
};

module.exports = ZelNodeController;
