define(["sugar-web/activity/activity","mustache", "sugar-web/env", "tutorial", "l10n"], function (activity,mustache,env, tutorial, l10n) {
    

    // Manipulate the DOM only when it is ready.
    requirejs(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;

        // Utility to fill a string number with zeros.
        function pad(n, width, z) {
            z = z || '0';
            width = width || 2;
            n = n + '';
            if (n.length >= width) {
                return n;
            }
            else {
                return new Array(width - n.length + 1).join(z) + n;
            }
        }

        function Stopwatch(counter, marks) {
            this.elem = document.createElement('li');
            var stopwatchList = document.getElementById('stopwatch-list');
            stopwatchList.appendChild(this.elem);
            var numStopWatches = document.getElementsByTagName('li').length;

            this.template =
                '<div class="card-body">' +
                    '<div class="row" id="' + numStopWatches + '">' +
                        '<div class="col-sm-2 col-md-2 col-lg-2 d-flex justify-content-center align-items-center">' +
                            '<div class="counter">00:00:00</div>' +
                        '</div>' +
                        '<div class="col-sm-4 col-md-4 col-lg-4 d-flex justify-content-center align-items-center">' +
                            '<div class="buttons-group">' +
                                '<button class="start-stop-button start" title="Start"></button>' +
                                '<button class="reset-button" title="Reset"></button>' +
                                '<button class="mark-button" title="Mark"></button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="col-sm-5 col-md-5 col-lg-5 d-flex align-items-center justify-content-center">' +
                            '<div class="marks"></div>' +
                        '</div>' +
                        '<div class="col-sm-1 col-md-1 col-lg-1 d-flex justify-content-center align-items-center p-0">' +
                            '<button class ="remove" title="Remove"></button>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            this.elem.innerHTML = mustache.render(this.template, {});

            this.counterElem = this.elem.querySelector('.counter');
            this.marksElem = this.elem.querySelector('.marks');
            this.running = false;
            this.previousTime = Date.now();
            this.tenthsOfSecond = 0;
            this.seconds = 0;
            this.minutes = 0;
            if(marks) {
                this.marks = marks;
                this.updateMarks();
            }
            else {
                this.marks = [];
            }
            if(counter) {
                this.minutes = parseInt(counter.split(":")[0]);
                this.seconds = parseInt(counter.split(":")[1]);
                this.tenthsOfSecond = parseInt(counter.split(":")[2]);
                this.updateView();
            }

            var that = this;

            this.startStopButton = this.elem.querySelector('.start-stop-button');
            this.startStopButton.onclick = function () {
                that.onStartStopClicked();
            };

            this.resetButton = this.elem.querySelector('.reset-button');
            this.resetButton.onclick = function () {
                that.onResetClicked();
            };

            this.markButton = this.elem.querySelector('.mark-button');
            this.markButton.onclick = function () {
                that.onMarkClicked();
            };

            this.removeButton = this.elem.querySelector('.remove');
            this.removeButton.onclick = function () {
                that.onRemoveClicked();
            };
        }

        Stopwatch.prototype.onStartStopClicked = function () {
            if (!this.running) {
                this.running = true;
                this.tick();
                this.startStopButton = this.elem.querySelector('.start-stop-button');
                this.startStopButton.title="Stop";
                this.resetButton = this.elem.querySelector('.reset-button');
                this.resetButton.disabled = true;
            }
            else {
                this.running = false;
                this.startStopButton.title="Start";
                this.resetButton = this.elem.querySelector('.reset-button');
                this.resetButton.disabled = false;
            }
            this.updateButtons();
        };

        Stopwatch.prototype.onResetClicked = function () {
            this.tenthsOfSecond = 0;
            this.seconds = 0;
            this.minutes = 0;
            if(this.running){
                this.onStartStopClicked();
            }
            else{
                this.running = false;
            }
            this.updateView();
            this.onClearMarksClicked();
        };

        Stopwatch.prototype.onMarkClicked = function () {
            if (this.marks.length >= 10) {
                this.marks.shift();
            }
            if(pad(this.minutes)!=00||pad(this.seconds)!=00||pad(this.tenthsOfSecond)!=00) {
                this.marks.push(pad(this.minutes) + ':' + pad(this.seconds) + ':' + pad(this.tenthsOfSecond));
            }
            this.updateMarks();
        };

        Stopwatch.prototype.onClearMarksClicked = function () {
            this.marks = [];
            this.updateMarks();
        };

        Stopwatch.prototype.onRemoveClicked = function () {
            var stopwatchList = document.getElementById('stopwatch-list');
            stopwatchList.removeChild(this.elem);
        };

        Stopwatch.prototype.tick = function () {
            if (!this.running) {
                return;
            }

            var currentTime = Date.now();

            if ((currentTime - this.previousTime) > 100) {
                this.previousTime = currentTime;
                this.update();
                this.updateView();
            }

            requestAnimationFrame(this.tick.bind(this));
        };

        Stopwatch.prototype.update = function () {
            this.tenthsOfSecond += 1;
            if (this.tenthsOfSecond == 10) {
                this.tenthsOfSecond = 0;
                this.seconds += 1;
            }
            if (this.seconds == 60) {
                this.seconds = 0;
                this.minutes += 1;
            }
        };

        Stopwatch.prototype.updateView = function () {
            this.counterElem.innerHTML = pad(this.minutes) + ':' +
                pad(this.seconds) + ':' + pad(this.tenthsOfSecond);
        };

        Stopwatch.prototype.updateMarks = function () {
            this.marksElem.innerHTML = '';
            for (var i = 0; i < this.marks.length; i++) {
                this.marksElem.innerHTML += this.marks[i];
                if (i !== (this.marks.length -1)) {
                    this.marksElem.innerHTML += ' - ';
                }
            }
        };

        Stopwatch.prototype.updateButtons = function () {
            if (this.running) {
                this.startStopButton.classList.add("stop");
                this.startStopButton.classList.remove("start");
            }
            else {
                this.startStopButton.classList.add("start");
                this.startStopButton.classList.remove("stop");
            }
        };

        // Button to add more stopwatches.
        var addButton = document.getElementById('add-stopwatch');
        addButton.onclick = function () {
            new Stopwatch();
        };

        
        env.getEnvironment(function(err, environment) {
            currentenv = environment;

            var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
            var language = environment.user ? environment.user.language : defaultLanguage;
            l10n.init(language);
    
            if (!environment.objectId) {
                 // Start with five stopwatches.
                for (var i = 0; i < 5; i++) {
                    new Stopwatch();
                }
            } else {
                activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
                    if (error==null && data!=null) {
                        stopwatchData = JSON.parse(data);
                        var i;
                        for (i = 0; i < Object.keys(stopwatchData).length; i++) { 
                            // Generate saved stopwatches
                            counter = stopwatchData[i]["counter"];
                            marks = stopwatchData[i]["marks"];
                            new Stopwatch(counter, marks);
                        }
                    }
                });
            }
        });
    });
    // Saving stopwatch data on stop.
    document.getElementById("stop-button").addEventListener('click', function (event) {
        var stopwatchData = document.getElementById("stopwatch-list").getElementsByTagName("li");
        stopwatchDict = {};
        var i;
        for (i = 0; i < stopwatchData.length; i++) { 
            stopwatchDict[i] = {};
            (stopwatchDict[i])["counter"] = stopwatchData[i].getElementsByClassName("counter")[0].innerHTML;
            (stopwatchDict[i])["marks"] = stopwatchData[i].getElementsByClassName("marks")[0].innerHTML.split(" - ");
        }
        stopwatchJSON = JSON.stringify(stopwatchDict);
        activity.getDatastoreObject().setDataAsText(stopwatchJSON);
        activity.getDatastoreObject().save();

    });
    
    // Switch to full screen when the full screen button is pressed
    document.getElementById("fullscreen-button").addEventListener('click', function() {
        document.getElementById("main-toolbar").style.display = "none";
        document.getElementById("canvas").style.top = "0px";
        document.getElementById("unfullscreen-button").style.visibility = "visible";
    });
    

    //Return to normal size
    document.getElementById("unfullscreen-button").addEventListener('click', function() {
        document.getElementById("main-toolbar").style.display = "block";
        document.getElementById("canvas").style.top = "55px";
        document.getElementById("unfullscreen-button").style.visibility = "hidden";

    });

    document.getElementById("help-button").addEventListener('click', function(e) {
        tutorial.start();
    });

    document.getElementById("export-csv-button").addEventListener('click', function() {
        var stopwatchData = document.getElementById("stopwatch-list").getElementsByTagName("li");
        var csvContent = "Marks No.,Time (s),Marks,Counter\n";
        var marksSet = [];

        for (i = 0; i < stopwatchData.length; i++) { 
            var marks = stopwatchData[i].getElementsByClassName("marks")[0].innerHTML.split(" - ");
            for (var j = 0; j < marks.length; j++) {
                if (marks.length === 1 && !marks[0]) break;
                var mark = marks[j];

                var minutes = parseInt(mark.split(":")[0]);
                var sec = parseInt(mark.split(":")[1]);
                var tenthsOfSec = parseInt(mark.split(":")[2]);
                var time = (minutes * 60) + sec + (tenthsOfSec / 10); 

                if (!marksSet.includes(mark)) marksSet.push(mark);
                var markNo = marksSet.indexOf(mark) + 1;
                csvContent += `${markNo},${time || ""},${mark},${i+1}\n`;
            };
        }
        var metadata = {
            mimetype: "text/csv",
            title: "Stopwatch export.csv",
            activity: "org.sugarlabs.ChartActivity",
            timestamp: new Date().getTime(),
            creation_time: new Date().getTime(),
            file_size: 0
        };
        requirejs(["sugar-web/datastore", "humane"], function (datastore, humane) {
            datastore.create(metadata, function () {
                humane.log(l10n.get("exportAsCSV"));
            }, csvContent);
        });
    });

});