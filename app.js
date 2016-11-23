'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    app = express(),
    querystring = require('querystring'),
    http = require('http'),
    request = require('request'),
    syncRequest = require('sync-request'),
    json2csv = require('json2csv');

global.appRoot = path.resolve(__dirname);

require('./config/index')(app);

var server = app.listen(process.env.PORT || 3004, 'localhost', function () {
    console.log('App listening on port ' + server.address().port);

    app.get('/getreport/', function(req, res) {
        var reportData = getReport(req.query.phrases.split(',')),
            url = getReportUrl(reportData[0].SearchedWith);
        res.json({
            success: true,
            url: url
        });
    });

    app.get('/temp/*', function(req, res) {
        var fileName = req.url.split('/')[2];
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', 'text/csv');
        var readStream = fs.createReadStream(getFilePath(req.url));
        readStream.pipe(res);
    });
});

function getReport(phrases) {
    var reportId = sendCreateReportRequest(phrases);
    checkReport(reportId);
    return getApiRequestResult('GetWordstatReport', reportId);
};

function checkReport(reportId) {
    var isReportDone = false;
    while(!isReportDone) {
        var reportList = getApiRequestResult('GetWordstatReportList', null);
        isReportDone = !!reportList.find(function(entry) {
            return entry.ReportID == reportId && entry.StatusReport == 'Done';
        });
    }
    return true;
};

function sendCreateReportRequest(phrases) {
    var params = {
        Phrases: phrases
    };

    return getApiRequestResult('CreateNewWordstatReport', params);
};

function getApiRequestResult(methodName, params) {
    var token = 'AQAAAAAW7SO4AAOcDa5vMl-pzEwelgJxBTl0mME',
        data = {
            method: methodName,
            token: token,
            param: params
        };

    var resp = syncRequest('POST', 'https://api-sandbox.direct.yandex.ru/live/v4/json/',{
        json: data
    });
    return JSON.parse(resp.getBody('utf8')).data;
};

function getReportUrl(data) {
    var report = json2csv({
            data: data,
            fields: [
                {
                    label: 'Фраза',
                    value: 'Phrase'
                }, {
                    label: 'Показы',
                    value: 'Shows'
                }]
        }),
        fileName = getGuid(),
        url = path.join('/temp/', fileName + '.csv');
    fs.writeFile(getFilePath(url), report, function(err) {
        if(err) throw err;
    });
    return url;
};

function getGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

function getFilePath(url) {
    return path.join(global.appRoot, url);
};