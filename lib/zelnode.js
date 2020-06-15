'use strict';

var Common = require('./common');

function ZelNodeController(node) {
  this.node = node;
  this.common = new Common({ log: this.node.log });
}

// looks like i need to have it in separate call as was causing issues
ZelNodeController.prototype.listZelNodes = function (req, res) {
  this.node.services.bitcoind.viewdeterministiczelnodelist(function (err, response) {
    if (err) {
      res.jsonp(err);
    }
    res.jsonp(response);
  });
};

ZelNodeController.prototype.listZelNodesFilter = function (req, res) {
  var filter = req.body.filter || req.params.filter || req.query.filter;
  this.node.services.bitcoind.viewdeterministiczelnodelist(function (err, response) {
    if (err) {
      res.jsonp(err);
    }
    if (!filter) {
      res.jsonp(response);
    } else if (filter.includes(',')) {
      const zelnodeList = response.result;
      // comma separated list of collateralHash-collateralIndex, collateralHash-collateralIndex or more filters
      const collateralsInInterest = filter.split(',');
      let goodZelNodes = [];
      collateralsInInterest.forEach((interestedFilter) => {
        if (interestedFilter.includes('-')) {
          const txhash = interestedFilter.split('-')[0];
          const outidx = interestedFilter.split('-')[1];
          const goodZelNodeList = zelnodeList.filter((zelnode) => (zelnode.txhash === txhash && zelnode.outidx === outidx))
          if (goodZelNodeList.length > 0) {
            goodZelNodes = goodZelNodes.concat(goodZelNodeList);
          }
        } else {
          const goodZelNodeList = zelnodeList.filter((zelnode) => JSON.stringify(zelnode).includes(interestedFilter))
          if (goodZelNodeList.length > 0) {
            goodZelNodes = goodZelNodes.concat(goodZelNodeList);
          }
        }
      })
      const zelnodeListToRespond = [...new Set(goodZelNodes)];
      res.jsonp({
        result: zelnodeListToRespond,
        error: response.error,
        id: response.id
      })
    } else if (filter.includes('-')) {
      const zelnodeList = response.result;
      // scneario for just one zelnode
      const goodZelNodes = [];
      const txhash = filter.split('-')[0];
      const outidx = filter.split('-')[1];
      const goodZelNode = zelnodeList.find((zelnode) => (zelnode.txhash === txhash && zelnode.outidx === outidx))
      if (goodZelNode) {
        goodZelNodes.push(goodZelNode);
      }
      res.jsonp({
        result: goodZelNodes,
        error: response.error,
        id: response.id
      })
    } else {
      const filteredList = response.result.filter(function (zelnode) {
        return JSON.stringify(zelnode).includes(filter);
      })
      res.jsonp({
        result: filteredList,
        error: response.error,
        id: response.id
      })
    }
  });
};

module.exports = ZelNodeController;
