define(["sugar-web/activity/activity","sugar-web/env", "l10n", "tutorial"], function (activity,env, l10n, tutorial) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();
		env.getEnvironment(function(err, environment) {
			var defaultLanguage = (typeof chrome != 'undefined' && chrome.app && chrome.app.runtime) ? chrome.i18n.getUILanguage() : navigator.language;
			var language = environment.user ? environment.user.language : defaultLanguage;
			l10n.init(language);
		});
		var myHighestScore = 0;

		//Loads highest score from Journal
		loadHighScore();
		var paused = true;
		var gameStarted = false;
		var $game = $('#canvas').blockrain({
      speed: 20,
      theme: 'candy',
	    autoplay: false,
	    autoplayRestart: true,
	    autoBlockWidth: true,
		  autoBlockSize: 24,
		  touchControls: true,
			highestScore: myHighestScore,
		onStart: function(){			
			gameStarted = true;
			handlePausePlay();
		},
		  onRestart: function(){
				loadHighScore(); // loads highscore when game is restarted.
				gameStarted = true;
				handlePausePlay();
			},
		  onGameOver: function(score){
				saveHighestScore();
				gameStarted=false;
				paused=true;
				var playPauseButton = document.getElementById('play-button');
				playPauseButton.classList.remove('pause');
				playPauseButton.classList.add('play');
			},

		  onLine: function(lines, scoreIncrement, score){
				if (score > myHighestScore){
					myHighestScore = score;
				}
			},
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

		// Save high score in Journal on Stop
		document.getElementById("stop-button").addEventListener('click', function (event) {
			saveHighestScore();
		});

		//Function to save high score
		function saveHighestScore() {
			console.log("writing...");
			var jsonData = JSON.stringify(myHighestScore);
			//console.log(jsonData);
			activity.getDatastoreObject().setDataAsText(jsonData);
			activity.getDatastoreObject().save(function (error) {
				if (error === null) {
					console.log("write done.");
				} else {
					console.log("write failed.");
				}
			});
		}

		//Function to load high score
		function loadHighScore() {
			activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
				if (error == null && data != null) {
					myHighestScore = JSON.parse(data);
					console.log(myHighestScore);
				}
			});
		}


    function switchTheme(next) {
      var themes = Object.keys(BlockrainThemes);
      var currentTheme = $game.blockrain('theme');
      var currentIx = themes.indexOf(currentTheme);

      if( next ) { currentIx++; }
      else { currentIx--; }

      if( currentIx >= themes.length ){ currentIx = 0; }
      if( currentIx < 0 ){ currentIx = themes.length-1; }

      $game.blockrain('theme', themes[currentIx]);
    }

	function handlePausePlay() {
		var playPauseButton = document.getElementById('play-button');
		if(!gameStarted){
			$game.blockrain('start');
		}
		else{
			if(paused) {
				$game.blockrain('resume');
				$game.blockrain('controls', true);
				playPauseButton.classList.remove('play');
				playPauseButton.classList.add('pause');
			}
			else {
				$game.blockrain('pause');
				$game.blockrain('controls', false);
				playPauseButton.classList.remove('pause');
				playPauseButton.classList.add('play');
			}
			paused = !paused;
		}
	}

    document.getElementById("btn-next").onclick = function() {
        switchTheme(true);
    };
	document.getElementById('play-button').addEventListener('click', function () {
		handlePausePlay();
	});
	document.getElementById("help-button").addEventListener('click', function(e) {
		tutorial.start();
	});
	});

});
