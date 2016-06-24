jq(function () {
    // Fetch command line parameters
    endPoint = parse("endpoint");
    fetchUrl = parse("fetch");
    registration = parse("registration");
    activityId = parse("activityid");
    actor = parse("actor");

    jq("input:radio[name='rdoVerb']").change(function () {
        // Default success and completion based on judgement verbs
        var verb = jq(this).val();
        if (verb == "Initialized") {
            jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
        }
        if (verb == "Completed") {
            jq("input:radio[name='rdoComplete'][value='true']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
        }
        if (verb == "Passed") {
            jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='true']").prop("checked", true);
        }
        if (verb == "Failed") {
            jq("input:radio[name='rdoComplete'][value='false']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='false']").prop("checked", true);
        }
        if (verb == "Terminated") {
            jq("input:radio[name='rdoComplete'][value='']").prop("checked", true);
            jq("input:radio[name='rdoSuccess'][value='']").prop("checked", true);
        }
    });
});

function GetAgentProfile() {
    cmi5Controller.getAgentProfile(endPointConfig, actor, setAgentProfile);
    return false;
}

function GetAuthToken() {
    cmi5Controller.getAuthToken(setAuthToken);
    return false;
}

function GetStateDocument() {
    cmi5Controller.getStateDocument(endPointConfig, activityId, actor, registration, setStateDocument);
    return false;
}

function GoLMS() {
    if ((typeof returnUrl) == "string" && returnUrl.length > 0) {
        document.location.href = returnUrl;
        return false;
    }
    self.close();           // Not allowed in FireFox
    return false;
}

function SendStatement() {
    // Read values from form
    var verbName = jq("input:radio[name='rdoVerb']:checked").val();
    var score = jq("#txtScore").val();
    var success = jq("input:radio[name='rdoSuccess']:checked").val();
    var complete = jq("input:radio[name='rdoComplete']:checked").val();
    var duration;
    var dH = jq("#durationHours").val();
    var dM = jq("#durationMinutes").val();
    var dS = jq("#durationSeconds").val();

    if (dH || dM || dS) {
        if (!dH) { dH = "0"; }
        if (!dM) { dM = "0"; }
        if (!dS) { dS = "0"; }

        duration = dH +
             ":" + dM +
             ":" + dS;
    }
    var progress = jq("#input_progress").val();

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
                var pt = "PT";
                if (dH > 0) pt += dH + "H";
                if (dM > 0) pt += dM + "M";
                if (dS > 0) pt += dS + "S";

                stmt.result.duration = pt;
            }
        }

        // Keep track of what verb we are sending in case of error and to display on the screen
        lastVerb = verbName;
        cmi5Controller.sendStatement(endPointConfig, stmt, sentStatement);

    } else {
        alert("Invalid verb passed: " + verbName);
    }

    return false;
}

function sentStatement(resp, obj) {
    // This is the callback method referenced in call to cmi5Controller.sendStatement()
    if (resp && resp.status == 200) {
        // statement was sent
        if (lastVerb == "Terminated") {
            MarkSuccess("btnStatement");
            MarkNext("btnLMS");
        }

        jq("#spnVerbsSent").append(lastVerb + "<br/>");

        //alert(obj.id);
    } else {
        alert("The server returned " + resp.status);
    }
}

function setAuthToken(authToken) {
    // This is the callback method referenced in call to cmi5Controller.getAuthToken()
    if (authToken) {
        setConfig(endPoint, authToken);
        jq("#txtAuthToken").val(authToken);
        GetAUProperties();
        MarkSuccess("btnAuthToken");
        MarkNext("btnState");
    }
}

function setAgentProfile(r) {
    // This is the callback method referenced in call to cmi5Controller.getAgentProfile()
    var obj = JSON.parse(r.response);
    jq("#txtProfile").val(JSON.stringify(obj, null, 3));

    MarkSuccess("btnProfile");
    MarkNext("btnStatement");
}

function setConfig(endPoint, token) {
    // Set LRS endpoint configuration
    endPointConfig = {
        "endpoint": endPoint,
        "auth": "Basic " + token
    };
}

function setStateDocument(r) {
    // This is the callback method referenced in call to cmi5Controller.getStateDocument()
    var obj = JSON.parse(r.response);

    // Display state
    jq("#txtState").val(JSON.stringify(obj, null, 3));

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
    jq("#spnMasteryScore").html("Mastery = " + masteryScore.toString());

    MarkSuccess("btnState");
    MarkNext("btnProfile");
}

function GetAUProperties() {
    // This function tries to read the name of the AU (object.definition.name) by reading the previous 
    // "launch" statement, which is written by the LMS.  If the AuthToken does not have authority to read
    // statements sent by the LMS (i.e. the LMS is not using the AuthToken), then this will not work.
    //
    // Note: Generally, the AU should know it's own name and activity definition.  Since this is a simulator,
    // however, we are using this method to find activity properties based on statements made by the LMS.
    //
    jq.support.cors = true;

    ADL.XAPIWrapper.changeConfig(endPointConfig);

    // Find last launched statement for this activityId
    var search = ADL.XAPIWrapper.searchParams();
    search["verb"] = ADL.verbs.launched.id;
    search["activity"] = activityId;
    search["registration"] = registration;
    search["limit"] = "1";

    ADL.XAPIWrapper.getStatements(search, null, function (r) {
        var response = $.parseJSON(r.response);
        var stmt;
        var stmts;
        var length;
        if (response.hasOwnProperty('statements')) {
            stmts = response.statements;
            length = stmts.length;
        } else {
            stmt = response;
            length = 1;
        }

        if (length > 0) {
            if (stmt) {
                stmts = $.parseJSON("[" + JSON.stringify(stmt) + "]");
            } else {
                stmts = $.parseJSON(JSON.stringify(stmts));
            }

            jq("#AUTitle").html("- " + stmts[0].object.definition.name["en-US"]);
            auName = stmts[0].object.definition.name;
            activityProperties = stmts[0].object;
        }
    });

    return false;
}

function MarkNext(buttonId) {
    // This is purely UI function.  Changes color of button to highlight the logical "next" buttton.
    jq("#" + buttonId).removeClass("btn-success btn-default").addClass("btn-primary");
}

function MarkSuccess(buttonId) {
    // This is purely UI function.  Changes color of button to highlight the clicked to show that it has been completed.
    jq("#" + buttonId).removeClass("btn-primary btn-default").addClass("btn-success");
}

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