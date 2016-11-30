/**
 * run functions while loading and resizing
 */
window.onload   = myOnload;
window.onresize = myResize;

/**
 * global variables
 */
var globFunc = {
    infoView: {},
    rankView: {},
    gameView: {},
    shotView: {},
    menuView: {}
};
var globData = {
    globTeamList: {},
    globPlayerList: {},
	currSelectedYearRange: [null,null],
	currSelectedAttribute: [null,null],
	currPlayerData: {},
	currPlayerName: 'kobe_bryant',
	currPlayerCompare: '',
	currPlayerFilter: {
		Team: null,
		Hint: null,
		Position: null,
		AllStar:  null,
		YearFrom: null,
		YearTo:   2015
	}
};
var debugMuteAll = false;

// UI callbacks
function myQueryTeam(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Team!', value); }
	globData.currPlayerFilter.Team = +value;
	globFunc.menuView.update();
}

function myQueryPosition(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Position!', value); }
	globData.currPlayerFilter.Position = +value;
	globFunc.menuView.update();
}

function myQueryYearFrom(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Year From!', value); }
	globData.currPlayerFilter.YearFrom = +value;
	globFunc.menuView.update();
}

function myQueryYearTo(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Year To!', value); }
	globData.currPlayerFilter.YearTo = +value;
	globFunc.menuView.update();
}

function myQueryAllStar(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for All Star or Not!', value); }
	globData.currPlayerFilter.AllStar = value;
	globFunc.menuView.update();
}

function myQueryAutoHintSubmit() {
	var value = document.getElementById('edit-queryForm-MenuView').value;
	value = value == 'all' ? null : value;
	// print out debug information
	if (!debugMuteAll) { console.log('set query hint as', value); }
	globData.currPlayerFilter.Hint = value;
	globFunc.menuView.update();
	return false;
}

/**
 * Function to change player
 * Linked to click button
 */
function myChangePlayer() {
	// if (!debugMuteAll) { console.log('asked for changing player!'); }
	if (globFunc.menuView.hidden) {
		globFunc.menuView.show();
	} else {
		globFunc.menuView.hide();
	}
}

// debug
//*/ click on screen to track mouse position
// if (!debugMuteAll) { document.onclick = DebugMouseMovePosition; }
function DebugMouseMovePosition(event) {
	var eventDoc, doc, body;
	event = event || window.event; // IE-ism
	// If pageX/Y aren't available and clientX/Y are,
	// calculate pageX/Y - logic taken from jQuery.
	// (This is to support old IE)
	if (event.pageX == null && event.clientX != null) {
		eventDoc = (event.target && event.target.ownerDocument) || document;
		doc = eventDoc.documentElement;
		body = eventDoc.body;
		event.pageX = event.clientX +
			(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
			(doc && doc.clientLeft || body && body.clientLeft || 0);
		event.pageY = event.clientY +
			(doc && doc.scrollTop || body && body.scrollTop || 0) -
			(doc && doc.clientTop || body && body.clientTop || 0 );
	}
	// Use event.pageX / event.pageY here
	console.log(event.pageX, event.pageY)
}
//*/

/**
 * main function
 */
function myOnload ()
{
    var self = this;

    // -------------------------------------------------------
    // load global class instance, one for each view
    // -------------------------------------------------------
	globFunc.menuView = new MenuView();
	globFunc.infoView = new InfoView();
    globFunc.rankView = new RankView();
    //globFunc.gameView = new GameMeshView();
    //globFunc.shotView = new ShotChart();

    // -------------------------------------------------------
    // load team list
    // -------------------------------------------------------
    d3.csv('data/teamHistory.csv', function (errorTeamHistory, dataTeamHistory) {
        if (errorTeamHistory) throw errorTeamHistory;

        // --------------------
        // [0] ----------------
        // construct team info lookup list
        globData.globTeamList = {lookup: {}, current: {}, history: {}};
        dataTeamHistory.forEach(function (team) {
            var teamid = +team.TEAM_ID;
            globData.globTeamList.lookup[team.TEAM_ABBREVIATION] = teamid;
            if (team.SUMMARY == 'Y') {
                globData.globTeamList.current[teamid] = team;
            } else {
                if (!globData.globTeamList.history.hasOwnProperty(team.TEAM_ID)) {
                    globData.globTeamList.history[teamid] = [team];
                } else {
                    globData.globTeamList.history[teamid].push(team);
                }
            }
        });
        // DEBUG HERE
        if (!debugMuteAll) {
            console.log('globData.globTeamList', globData.globTeamList);
        }

        // --------------------
        // [1] ----------------
        // load player list
        d3.json('data/playerIndex.json', function (errorPlayerIndex, dataPlayerIndex) {
            if (errorPlayerIndex) throw errorPlayerIndex;
            // [1.0]
            // build query filter
            globData.globPlayerList = dataPlayerIndex;
            globFunc.menuView.init(400);
            globFunc.menuView.update();
	        globFunc.menuView.hide();
	        // initialize objects
	        globFunc.infoView.init(600);
	        globFunc.rankView.init(600);
            // DEBUG HERE
	        // if (!debugMuteAll) {}
            // --------------------
            // [1.1]
            MainReload();
        });
    });
}

/**
 * Load the main project
 */
function MainReload(reloadData)
{
	/**
	 * Function to query the player
	 * @param info
	 * @param string
	 * @returns {*}
	 */
	// var searchPlayer = function (info, string) {
	//   var id = 0;
	// 	 info['rowSet'].forEach(function(d, i) { if (d[4] == string) id = i; });
	// 	 return info['rowSet'][id];
	// };
	// --------------------------------------
	// get current player info
	//var playerInfo = searchPlayer(globData.globPlayerList, globData.currPlayerName);
	// --------------------------------------
    // Complete All Views
	if (reloadData == null || reloadData) {
		d3.json('data/playerList/' + globData.currPlayerName + '.json', function (errorPlayer, player) {
			if (errorPlayer) throw errorPlayer;
			// DEBUG HERE
			if (!debugMuteAll) {
				console.log(globData.currPlayerName, player);
			}
			globData.currPlayerData = player;
			// [0]
			// -- Info View
			globFunc.infoView.update();
			// [1]
			// -- Ranking View
			//ranking.init(500);
			globFunc.rankView.update();
			//
			// -- Game Mesh View
			//gameMeshView.init(600);
			//gameMeshView.update(playerInfo[0], player, player.info.FROM_YEAR, player.info.TO_YEAR, 'PTS');
			//
			// -- Shot Chart View
			//shotChart.init(600);
			//shotChart.update(playerInfo[0], player, player.info.FROM_YEAR, player.info.TO_YEAR);
		});
	} else {
		globFunc.rankView.update();
	}
}

/**
 * resizing function
 */
function myResize() {
	globFunc.menuView.resize();
	globFunc.infoView.resize();
	globFunc.rankView.resize();
    //gameMeshView.resize();
}

