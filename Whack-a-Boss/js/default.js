// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    function log(mesg) {
        if (mesg == undefined || mesg == null) return;
        Debug.writeln("[WhackAMatt]: " + mesg);
    };

    function getRandom(top) {
        return Math.floor(Math.random() * top);
    };

    function timer(length, callback) {
        var interval = length || 100;
        var _timer;
        if (!callback)
            return false;
        _timer = function (interval, callback) {
            this.stop = function () {
                clearInterval(self.id);
            };
            this.internalCallback = function () {
                callback(self);
            };
            this.reset = function (val) {
                if (self.id) clearInterval(self.id);
                var val = val || 100;
                this.id = setInterval(this.internalCallback, val);
            };
            this.interval = interval;
            this.id = setInterval(this.internalCallback, this.interval);
            var self = this;
        };
        return new _timer(interval, callback);
    };

    var animating = WinJS.Promise.wrap();
    function updateBadge(element, text) {
        animating = animating.then(function () {
            element.innerText = text;
            return WinJS.UI.Animation.updateBadge(element);
        });
    };

    function getMole(i) {
        return document.querySelectorAll(".mole")[i];
    };

    function showMole(element) {
        if (element.style.opacity == "1") return;
        if (getRandom(10) >= moleRatio) {
            element.innerText = " NOT PHB";
            element.style.backgroundImage = "url('content/notboss" + getRandom(24) + ".png')";
        } else {
            element.innerText = " PHB";
            element.style.backgroundImage = "url('content/boss" + getRandom(21) + ".png')";
        }
        if (element.style.border != "10px solid transparent") {
            element.style.border = "10px solid transparent";
            WinJS.UI.Animation.pointerUp(element);
        }
        element.style.opacity = "1"
        WinJS.UI.Animation.showPopup(element, { top: "200px", left: "0px" });
    };

    function hideMole(element) {
        if (element.style.opacity == "0") return;
        WinJS.UI.Animation.hidePopup(element, { top: "200px", left: "0px" });
        element.style.opacity = "0"
    };

    var gameTimer;
    var scoreGame = 0;
    var scoreMole = 0;
    var scoreMoleMax = 5;
    var scoreBoss = 0;
    var scoreBossMax = 5;
    var moleRatio = 6;
    var speed = 1000;
    var countMoles = 0;
    var status = "clean";

    function startGame() {
        log("startGame");
        status = "playing";
        panel_gamemesg.style.opacity = "0";
        sound_bg.pause();
        var e = document.querySelectorAll(".tile");
        for (var i = 0; i < e.length; i++) e[i].style.opacity = "1";
        game_area.style.opacity = "1";
        var mole;
        gameTimer = new timer(0, function (timer) {
            mole = getMole(getRandom(countMoles));
            if (mole.style.opacity == '1') {
                hideMole(mole);
                if (mole.innerText == " PHB") {
                    mole.soundMoleMiss.play();
                    updateScore(score_mole, ++scoreMole);
                }
                if (status != "playing") return;
            } else {
                showMole(mole);
            }
            timer.reset(getRandom(speed));
        });
    };

    function stopGame() {
        log("stopGame");
        if (gameTimer != null) gameTimer.stop();
        gameTimer = null;
    };

    function endGame() {
        log("endGame");
        stopGame();
        status = "game over";
        game_area.style.opacity = "0";
        btn_play.style.backgroundImage = "url('images/btn_play.png')";
        btn_home.style.backgroundColor = "#00b6ff";
        btn_play.style.opacity = "0";
        panel_gameover.style.opacity = "1";
        animating = WinJS.UI.Animation.showPanel(panel_gameover, { top: "300px", left: "0px" });
        if (gameSound) new Audio("sounds/gameover_" + getRandom(6) + ".wav").play();
        updateTile();
    };

    function updateTile() {
        var Notifications = Windows.UI.Notifications;
        var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareText01);
        var tileAttributes = tileXml.getElementsByTagName("text");
        tileAttributes[0].appendChild(tileXml.createTextNode(scoreGame));
        tileAttributes[1].appendChild(tileXml.createTextNode("PHB's whacked!"));
        tileAttributes[2].appendChild(tileXml.createTextNode(new Date().toTimeString()));
        var tileNotification = new Notifications.TileNotification(tileXml);
        tileNotification.expirationTime = new Date(Date.now() + 600 * 1000);
        Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);

        tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareImage);
        var tileImageAttributes = tileXml.getElementsByTagName("image");
        tileImageAttributes[0].setAttribute("src", "ms-appx:///content/boss" + getRandom(7) + ".png");
        tileNotification = new Notifications.TileNotification(tileXml);
        tileNotification.expirationTime = new Date(Date.now() + 600 * 1000);
        Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        /*
        var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquarePeekImageAndText01);
        var tileAttributes = tileXml.getElementsByTagName("text");
        tileAttributes[0].appendChild(tileXml.createTextNode(scoreGame));
        tileAttributes[1].appendChild(tileXml.createTextNode("Matt's whacked"));
        tileAttributes[2].appendChild(tileXml.createTextNode(new Date().toTimeString()));
        var tileImageAttributes = tileXml.getElementsByTagName("image");
        tileImageAttributes[0].setAttribute("src", "ms-appx:///content/matt" + getRandom(7) + ".png");
        var tileNotification = new Notifications.TileNotification(tileXml);
        tileNotification.expirationTime = new Date(Date.now() + 600 * 1000);
        Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        */
    };

    function resetGame() {
        log("resetGame");
        if (status == "clean") return;
        stopGame();
        scoreGame = 0;
        scoreMole = 0;
        scoreBoss = 0;
        game_area.style.opacity = "0";
        var e = document.querySelectorAll(".mole");
        for (var i = 0; i < e.length; i++) e[i].style.opacity = "0";
        e = document.querySelectorAll(".tile");
        for (var i = 0; i < e.length; i++) e[i].style.opacity = "0";
        panel_gameover.style.opacity = "0";
        panel_gamemesg.style.opacity = "1";
        score_game.innerText = 0;
        score_mole.innerText = 0;
        score_boss.innerText = 0;
        btn_play_caption.innerText = "Play";
        btn_play.style.opacity = "1";
        btn_home.style.backgroundColor = "transparent";
        status = "clean";
        if (gameMusic) sound_bg.play();
    };

    function updateScore(element, score) {
        log("updateScore");
        element.innerText = score;
        if (scoreBoss >= scoreBossMax || scoreMole >= scoreMoleMax) endGame();
    };

    function onPointerDown(evt) {
        log("onPointerDown");
        if (status != "playing") return;
        var e = evt.srcElement;
        if (e.style.opacity == "0") return;
        if (e.innerText != " PHB") {
            e.style.border = "10px solid #f00";
        } else {
            e.style.border = "10px solid #00b6ff";
        }
        WinJS.UI.Animation.pointerDown(e);
    };

    function onPointerUp(evt) {
        log("onPointerUp");
        if (status != "playing") return;
        var e = evt.srcElement;
        if (e.style.opacity == "0") return;
        WinJS.UI.Animation.pointerUp(e);
        hideMole(e);
        if (e.innerText != " PHB") {
            updateScore(score_boss, ++scoreBoss);
            if (gameSound) e.soundBossHit.play();
        } else {
            updateScore(score_game, ++scoreGame);
            if (gameSound) e.soundMoleHit.play();
        }
    };

    function onPointerDownHome(evt) {
        log("onPointerDownHome");
        if (status == "playing" || status == "clean") return;
        if (evt.srcElement.id != "btn_home") return;
        btn_home.style.backgroundColor = "#ff6a00";
        WinJS.UI.Animation.pointerDown(btn_home);
    };

    function onPointerUpHome(evt) {
        log("onPointerUpHome");
        if (status == "playing" || status == "clean") return;
        if (evt.srcElement.id != "btn_home") return;
        btn_home.style.backgroundColor = "#00b6ff";
        WinJS.UI.Animation.pointerUp(btn_home);
        if (btn_play.style.backgroundColor = "#ff6a00") {
            btn_play.style.backgroundColor = "#00b6ff"
            WinJS.UI.Animation.pointerUp(btn_play);
        }
        resetGame();
    };

    function onPointerDownPlay(evt) {
        log("onPointerDownPlay");
        if (status == "game over") return;
        if (evt.srcElement.id != "btn_play") return;
        btn_play.style.backgroundColor = "#ff6a00";
        WinJS.UI.Animation.pointerDown(btn_play);
    };

    function onPointerUpPlay(evt) {
        log("onPointerUpPlay");
        if (status == "game over") return;
        if (evt.srcElement.id != "btn_play") return;
        btn_play.style.backgroundColor = "#00b6ff";
        if (status == "playing") {
            stopGame();
            btn_play.style.backgroundImage = "url('images/btn_play.png')";
            btn_play_caption.innerText = "Resume";
            status = "paused";
            btn_home.style.backgroundColor = "#00b6ff";
        } else {
            startGame();
            btn_play.style.backgroundImage = "url('images/btn_pause.png')";
            btn_play_caption.innerText = "Pause";
            if (btn_home.style.backgroundColor == "#ff6a00") WinJS.UI.Animation.pointerUp(btn_home);
            btn_home.style.backgroundColor = "transparent";
        }
        WinJS.UI.Animation.pointerUp(btn_play);
    };

    function onClickMoleMax(evt) {
        log("clickMoleMax");
        scoreMoleMax = parseInt(ctrl_molemax.value);
        setGameMessage();
    };

    function onClickBossMax(evt) {
        log("clickBossMax");
        scoreBossMax = parseInt(ctrl_bossmax.value);
        setGameMessage();
    };

    function onClickMoleRatio(evt) {
        log("clickMoleRatio");
        moleRatio = parseInt(ctrl_moleratio.value);
    };

    function onClickSpeed(evt) {
        log("clickSpeed");
        speed = 2000 - (200 * parseInt(ctrl_speed.value));
    };

    var gameMusic = true;
    function onChangeGameMusic(evt) {
        gameMusic = (evt.srcElement.valueAsNumber == 1) ? true : false;
        if (gameMusic) {
            sound_bg.play();
        } else {
            sound_bg.pause();
        }
    };

    var gameSound = true;
    function onChangeGameSound(evt) {
        gameSound = (evt.srcElement.valueAsNumber == 1) ? true : false;
    };

    function setGameMessage() {
        panel_gamemesg.innerHTML = "Whack the Pointy Haired Boss (PHB) to your heart's content! However, PHB doesn't make it easy; for he has many \"horrible boss\" peers in modern corporate history he'd throw in as decoys. Game is over when PHB manages to escape unscathed <u>" + scoreMoleMax + " times</u>, or when you whack those other \"horrible bosses\" <u>" + scoreBossMax + " times</u>.";
    };

    var page = WinJS.UI.Pages.define("default.html", {
        ready: function (element, options) {
            btn_home.addEventListener("MSPointerDown", onPointerDownHome, false);
            btn_home.addEventListener("MSPointerUp", onPointerUpHome, false);
            btn_play.addEventListener("MSPointerDown", onPointerDownPlay, false);
            btn_play.addEventListener("MSPointerUp", onPointerUpPlay, false);
            countMoles = document.querySelectorAll(".mole").length;
            var mole;
            for (var i = 0; i < countMoles; i++) {
                mole = getMole(i);
                mole.addEventListener("MSPointerUp", onPointerUp, false);
                mole.addEventListener("MSPointerDown", onPointerDown, false);
                mole.soundMoleHit = new Audio("sounds/mole_hit.wma");
                mole.soundMoleMiss = new Audio("sounds/mole_miss.wav");
                mole.soundBossHit = new Audio("sounds/boss_hit.wav");
            }
            WinJS.Application.onsettings = function (e) {
                e.detail.applicationcommands = { "panel_settings": { title: "Game settings", href: "default.html" } };
                WinJS.UI.SettingsFlyout.populateSettings(e);
            };
            ctrl_molemax.addEventListener("MSPointerUp", onClickMoleMax, false);
            ctrl_bossmax.addEventListener("MSPointerUp", onClickBossMax, false);
            ctrl_moleratio.addEventListener("MSPointerUp", onClickMoleRatio, false);
            ctrl_speed.addEventListener("MSPointerUp", onClickSpeed, false);
            ctrl_music.addEventListener("MSPointerUp", onChangeGameMusic, false);
            ctrl_sound.addEventListener("MSPointerUp", onChangeGameSound, false);
            setGameMessage();
            window.onresize = function (e) {
                var viewState = appView.value;
                log("window.onresize: " + viewState);
                if (viewState === appViewState.snapped) {
                    if (status == "playing") {
                        stopGame();
                        btn_play.style.backgroundImage = "url('images/btn_play.png')";
                        btn_play_caption.innerText = "Resume";
                        status = "paused";
                        btn_home.style.backgroundColor = "#00b6ff";
                    }
                    panel_gamesnapped.style.opacity = "1";
                    panel_gamesnapped.style.width = "100%";
                    panel_gamesnapped.style.height = "100%";
                } else {
                    panel_gamesnapped.style.opacity = "0";
                    panel_gamesnapped.style.width = "0px";
                    panel_gamesnapped.style.height = "0px";
                }
            };
        },

    });
    Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
    app.start();
})();
