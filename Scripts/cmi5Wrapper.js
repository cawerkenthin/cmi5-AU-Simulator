jq(function () {
    // Fetch command line parameters
    endPoint = parse("endpoint");
    fetchUrl = parse("fetch");
    registration = parse("registration");
    activityId = parse("activityid");
    actor = parse("actor");
});

function GetAgentProfile() {
    cmi5Controller.getAgentProfile(endPointConfig, actor, setAgentProfile);
    return false;
}

/* Moved to controller
function GetAuthToken() {
    cmi5Controller.getAuthToken(setAuthToken);
    return false;
}
*/

/* Moved to controller
function GetStateDocument() {
    cmi5Controller.getStateDocument(endPointConfig, activityId, actor, registration, setStateDocument);
    return false;
}
*/

function GoLMS() {  
    if ((typeof returnUrl) == "string" && returnUrl.length > 0) {
       var href = decodeURIComponent(returnUrl);
       document.location.href = href;
        return false;
    }
    self.close();           // Not allowed in FireFox
    return false;
}

function SendStatement(verbName, score, duration, progress) {
    var agent = JSON.parse(actor);

    // What verb is to be sent?
    var verb;
    switch (verbName) {
        case "Initialized":
            verb = ADL.verbs.initialized;
            break;
        case "Completed":
            verb = ADL.verbs.completed;
            break;
        case "Passed":
            verb = ADL.verbs.passed;
            break;
        case "Failed":
            verb = ADL.verbs.failed;
            break;
        case "Terminated":
            verb = ADL.verbs.terminated;
            break;
    }

    if (verb) {

        // Context extensions were read from the State document's context template
        var cExtentions = contextExtensions;

        if (verbName.toUpperCase() == "PASSED" || verbName.toUpperCase() == "FAILED") {
            // Passed and Failed statements require the masteryScore as an context extension
            cExtentions["https://w3id.org/xapi/cmi5/context/extensions/masteryScore"] = masteryScore;
        }

        // Get basic cmi5 defined statement object
        var stmt = cmi5Controller.getcmi5DefinedStatement(agent,
                                                          verb,
                                                          activityProperties,
                                                          registration,
                                                          contextActivities,
                                                          cExtentions);

        // Add UTC timestamp.  This is required by cmi5 spec.
        stmt.timestamp = (new Date()).toISOString();

        // Do we need a result object?
        if (success || complete || score || duration || progress) {
            stmt.result = {};

            if (complete) {
                stmt.result.completion = true;
            }

            if (success) {
                stmt.result.success = true;
            }

            if (score) {
                stmt.result.score = { "scaled": parseFloat(score) };
            }

            if (progress) {
                stmt.result.extensions = { "https://w3id.org/xapi/cmi5/result/extensions/progress": parseInt(progress) };
            }

            if (duration) {
                stmt.result.duration = pt;
            }

            // Statements that include success or complete must include a moveon activity in the context
            if (success || complete) {
                stmt.context.contextActivities.category.push(
                {
                    "id": "https://w3id.org/xapi/cmi5/context/categories/moveon"
                });
            }
        }

        // Keep track of what verb we are sending in case of error and to display on the screen
        lastVerb = verbName;
        cmi5Controller.sendStatement(endPointConfig, stmt, sentStatement);

    } else {
        console.log("Invalid verb passed: " + verbName);
    }

    return false;
}

function sentStatement(resp, obj) {
    // This is the callback method referenced in call to cmi5Controller.sendStatement()
    if (resp && resp.status == 200) {
        // statement was sent
        console.log("Statement sent");
    }
}

/* Moved to controller
function setAuthToken(authToken) {
    // This is the callback method referenced in call to cmi5Controller.getAuthToken()
    if (authToken) {
        setConfig(endPoint, authToken);       
    }
}
*/

function setAgentProfile(r) {
    // This is the callback method referenced in call to cmi5Controller.getAgentProfile()
    var obj = JSON.parse(r.response);    
}

/* Moved to controller
function setConfig(endPoint, token) {
    // Set LRS endpoint configuration
    endPointConfig = {
        "endpoint": endPoint,
        "auth": "Basic " + token
    };
}
*/

/* Moved to controller
function setStateDocument(r) {
    // This is the callback method referenced in call to cmi5Controller.getStateDocument()
    var obj = JSON.parse(r.response);
    
    // Get context activities
    contextActivities = obj.contextTemplate.contextActivities;

    // Get context extensions
    contextExtensions = obj.contextTemplate.extensions;

    // Get returnUrl
    var t = typeof (obj["returnURL"]);
    if (t == "string") {
        returnUrl = obj["returnURL"];
    }

    // Display mastery score
    masteryScore = obj["masteryScore"];    
}
*/

function parse(val) {
    // Utility function to parse command line parameters
    var result = "Not found",
        tmp = [];
    val = val.toUpperCase();
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0].toUpperCase() === val) result = decodeURIComponent(tmp[1]);
        });
    return result;
}
